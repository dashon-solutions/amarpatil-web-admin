const Booking = require("../models/Booking.model");
const Expense = require("../models/Expense.model");
const Ledger = require("../models/Ledger.model");
const Lead = require("../models/Lead.model");
const Album = require("../models/Album.model");
const Payment = require("../models/Payment.model");
const TeamMember = require("../models/TeamMember.model");
const Assignment = require("../models/Assignment.model");
const dayjs = require("dayjs");

exports.getDashboardAnalytics = async (req, res) => {
    try {
        const { filter = "year", month, year, startDate, endDate } = req.query; 
        
        let startBound, endBound;
        const now = dayjs();
        
        if (filter === "week") {
            startBound = now.subtract(7, 'day').startOf('day').toDate();
            endBound = now.endOf('day').toDate();
        } else if (filter === "month") {
            if (month && year) {
                startBound = dayjs().year(year).month(month - 1).startOf('month').toDate();
                endBound = dayjs().year(year).month(month - 1).endOf('month').toDate();
            } else {
                startBound = now.startOf('month').toDate();
                endBound = now.endOf('month').toDate();
            }
        } else if (filter === "year") {
            const y = year || now.year();
            startBound = dayjs().year(y).startOf('year').toDate();
            endBound = dayjs().year(y).endOf('year').toDate();
        } else if (filter === "custom") {
            startBound = startDate ? dayjs(startDate).startOf('day').toDate() : now.startOf('year').toDate();
            endBound = endDate ? dayjs(endDate).endOf('day').toDate() : now.endOf('day').toDate();
        } else {
            // all
            startBound = new Date(0);
            endBound = now.endOf('day').toDate();
        }

        const dateQuery = { $gte: startBound, $lte: endBound };

        // ---------------------------------------------------------
        // 1. OVERVIEW: Macro KPIs
        // ---------------------------------------------------------
        const revenueAggr = await Payment.aggregate([
            { $match: { date: dateQuery } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalRevenue = revenueAggr[0]?.total || 0;

        const expensesAggr = await Expense.aggregate([
            { $match: { createdAt: dateQuery } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalExpenses = expensesAggr[0]?.total || 0;

        const teamPaymentsAggr = await Ledger.aggregate([
            { $unwind: "$payments" },
            { $match: { "payments.date": dateQuery } },
            { $group: { _id: null, total: { $sum: "$payments.amount" } } }
        ]);
        const totalTeamPayments = teamPaymentsAggr[0]?.total || 0;

        const netProfit = totalRevenue - (totalExpenses + totalTeamPayments);

        const pendingAggr = await Booking.aggregate([
            { $group: { _id: null, total: { $sum: "$remainingAmount" } } }
        ]);
        const pendingClientPayments = pendingAggr[0]?.total || 0;

        // Macro Timeline Chart (Line/Bar)
        // Groups by day if timeframe is short (week/month), or by month if long (year/custom)
        const diffDays = dayjs(endBound).diff(startBound, 'days');
        const groupByMonth = diffDays > 60;
        
        let timelineData = [];

        if (groupByMonth) {
           const revBM = await Payment.aggregate([
               { $match: { date: dateQuery } },
               { $group: { _id: { y: {$year:"$date"}, m: {$month:"$date"} }, total: { $sum: "$amount" } } }
           ]);
           const expBM = await Expense.aggregate([
               { $match: { createdAt: dateQuery } },
               { $group: { _id: { y: {$year:"$createdAt"}, m: {$month:"$createdAt"} }, total: { $sum: "$amount" } } }
           ]);

           const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
           let startNode = dayjs(startBound).startOf('month');
           const endNode = dayjs(endBound).startOf('month');
           
           while(startNode.isBefore(endNode) || startNode.isSame(endNode, 'month')) {
              const y = startNode.year();
              const m = startNode.month() + 1; // 1-12
              
              const rev = revBM.find(r => r._id.y === y && r._id.m === m)?.total || 0;
              const exp = expBM.find(e => e._id.y === y && e._id.m === m)?.total || 0;
              
              timelineData.push({
                 name: `${monthNames[m-1]} ${String(y).slice(-2)}`,
                 Revenue: rev,
                 Expenses: exp,
                 Profit: rev - exp
              });
              startNode = startNode.add(1, 'month');
           }
        } else {
           // Group by Day
           const revBD = await Payment.aggregate([
               { $match: { date: dateQuery } },
               { $group: { _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } }, total: { $sum: "$amount" } } }
           ]);
           const expBD = await Expense.aggregate([
               { $match: { createdAt: dateQuery } },
               { $group: { _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } }, total: { $sum: "$amount" } } }
           ]);

           let startNode = dayjs(startBound).startOf('day');
           const endNode = dayjs(endBound).startOf('day');
           
           while(startNode.isBefore(endNode) || startNode.isSame(endNode, 'day')) {
              const dStr = startNode.format("YYYY-MM-DD");
              const rev = revBD.find(r => r._id.date === dStr)?.total || 0;
              const exp = expBD.find(e => e._id.date === dStr)?.total || 0;
              
              timelineData.push({
                 name: startNode.format("MMM D"),
                 Revenue: rev,
                 Expenses: exp,
                 Profit: rev - exp
              });
              startNode = startNode.add(1, 'day');
           }
        }


        // ---------------------------------------------------------
        // 2. CLIENT: Pipelines & Actionable Insights
        // ---------------------------------------------------------
        
        // Client Table 
        const clientTableList = await Booking.find({ createdAt: dateQuery }).sort({ createdAt: -1 });
        
        // Paid vs Pending Donut (Client overall stats from bookings created in this timeframe)
        let cPaid = 0;
        let cPending = 0;
        clientTableList.forEach(b => {
           cPaid += (b.totalAmount - b.remainingAmount);
           cPending += b.remainingAmount;
        });

        // Album Tracking Stats
        const albumsInTimeframe = await Album.find({ createdAt: dateQuery });
        const albumTracking = {
           pendingSelection: albumsInTimeframe.filter(a => a.status === 'created' || a.status === 'sent_for_selection').length,
           inProgress: albumsInTimeframe.filter(a => ['selection_done','design_assigned','design_completed','printing'].includes(a.status)).length,
           completed: albumsInTimeframe.filter(a => a.status === 'design_completed').length, // overlapping but standard logic
           delivered: albumsInTimeframe.filter(a => a.status === 'delivered').length
        };

        // Upcoming Reminders
        const nowMs = new Date();
        const futureLimit = dayjs().add(14, 'day').toDate();
        const upcomingEvents = await Booking.find({ eventDate: { $gte: nowMs, $lte: futureLimit }, status: 'upcoming' }).sort({eventDate: 1}).limit(5);
        const paymentDue = await Booking.find({ remainingAmount: { $gt: 0 }, status: { $ne: 'cancelled'} }).sort({createdAt: -1}).limit(5);
        const albumPending = await Album.find({ status: { $nin: ['delivered'] } }).sort({updatedAt: -1}).limit(5);

        // Upcoming Team Assignments
        const upcomingAssignments = await Assignment.find({ shootDate: { $gte: nowMs, $lte: futureLimit }, status: { $ne: 'completed' } })
            .populate('teamMemberId', 'name role')
            .populate('bookingId', 'clientName shootType eventDate')
            .sort({ shootDate: 1 }).limit(10);


        // ---------------------------------------------------------
        // 3. TEAM: Performance & Payables
        // ---------------------------------------------------------
        const allLedgers = await Ledger.find({ createdAt: dateQuery }).populate("teamMemberId");
        
        const teamPerformanceMap = {};
        allLedgers.forEach(ledger => {
            const tm = ledger.teamMemberId;
            if (!tm) return;
            const tid = tm._id.toString();
            if(!teamPerformanceMap[tid]) {
                teamPerformanceMap[tid] = {
                    id: tid,
                    name: tm.name,
                    role: tm.role || "Crew",
                    totalEarned: 0,
                    totalPaid: 0,
                    remainingPayable: 0
                };
            }
            teamPerformanceMap[tid].totalEarned += ledger.totalAmount;
            teamPerformanceMap[tid].totalPaid += ledger.paidAmount;
            teamPerformanceMap[tid].remainingPayable += (ledger.totalAmount - ledger.paidAmount);
        });

        const teamList = Object.values(teamPerformanceMap);
        
        let tPaid = 0;
        let tPending = 0;
        const teamEarningsChart = [];
        teamList.forEach(t => {
           tPaid += t.totalPaid;
           tPending += t.remainingPayable;
           teamEarningsChart.push({ name: t.name, Earned: t.totalEarned });
        });
        
        // Sorting chart
        teamEarningsChart.sort((a,b) => b.Earned - a.Earned);


        // Final Package Delivery
        res.status(200).json({
            success: true,
            overview: {
                kpis: {
                    totalRevenue,
                    totalExpenses,
                    totalTeamPayments,
                    netProfit,
                    pendingClientPayments
                },
                timeline: timelineData,
                reminders: { upcomingEvents }
            },
            client: {
                table: clientTableList,
                paidVsPending: [
                   { name: "Collected", value: cPaid },
                   { name: "Uncollected", value: cPending }
                ],
                albumTracking,
                reminders: { upcomingEvents, paymentDue, albumPending }
            },
            team: {
                table: teamList,
                earningsChart: teamEarningsChart,
                paidVsPending: [
                   { name: "Paid Out", value: tPaid },
                   { name: "Due Payable", value: tPending }
                ],
                upcomingAssignments
            }
        });
        
    } catch (error) {
        console.error("Dashboard Analytics Error: ", error);
        res.status(500).json({ success: false, message: "Error generating analytics" });
    }
};
