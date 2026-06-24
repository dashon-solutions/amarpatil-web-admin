const Ledger = require("../models/Ledger.model");
const TeamMember = require("../models/TeamMember.model");

exports.getSummary = async (req, res) => {
  try {
    const teamMembers = await TeamMember.find();
    const ledgers = await Ledger.find();
    
    // Build map for quick aggregation
    const summary = {};
    teamMembers.forEach(m => {
       summary[m._id.toString()] = {
          member: m,
          totalAssigned: 0,
          totalPaid: 0,
          totalPending: 0
       };
    });
    
    ledgers.forEach(l => {
       const mId = l.teamMemberId.toString();
       if (summary[mId]) {
          summary[mId].totalAssigned += l.totalAmount;
          summary[mId].totalPaid += l.paidAmount;
          summary[mId].totalPending += (l.totalAmount - l.paidAmount);
       }
    });

    res.status(200).json({ success: true, summary: Object.values(summary) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getMemberLedger = async (req, res) => {
  try {
     const entries = await Ledger.find({ teamMemberId: req.params.memberId })
        .populate("referenceId", "clientName shootType driveLink") // Will partially populate if reference is matched
        .sort({ createdAt: -1 });

     let totalAssigned = 0;
     let totalPaid = 0;
     entries.forEach(e => {
        totalAssigned += e.totalAmount;
        totalPaid += e.paidAmount;
     });

     res.status(200).json({ success: true, entries, totalAssigned, totalPaid, totalPending: totalAssigned - totalPaid });
  } catch (error) {
     res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.addManualEntry = async (req, res) => {
  try {
    const { teamMemberId, amount, description, type } = req.body;
    
    // type is 'expense' or 'payment'
    const isPayment = type === 'payment';

    const entry = await Ledger.create({
       teamMemberId,
       referenceType: "manual",
       description: isPayment ? `Direct Payment: ${description}` : description,
       proofImage: req.file ? req.file.cloudinaryUrl : null,
       totalAmount: isPayment ? 0 : (Number(amount) || 0),
       paidAmount: isPayment ? (Number(amount) || 0) : 0
    });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed logic" });
  }
};

exports.addPayment = async (req, res) => {
  try {
     const ledger = await Ledger.findById(req.params.id);
     if (!ledger) return res.status(404).json({ success: false, message: "Ledger entry not found" });

     const { amount, method, notes } = req.body;
     const paymentAmount = Number(amount);

     const newPayment = {
        amount: paymentAmount,
        method: method || "cash",
        notes: notes || ""
     };

     if (req.file && req.file.cloudinaryUrl) {
        newPayment.referenceImage = req.file.cloudinaryUrl;
     }

     ledger.payments.push(newPayment);
     ledger.paidAmount += paymentAmount;
     await ledger.save();

     res.status(200).json({ success: true, ledger });
  } catch (error) {
     res.status(500).json({ success: false, message: "Failed to process payment" });
  }
};

exports.editLedgerAmount = async (req, res) => {
  try {
    const { amount } = req.body;
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ success: false, message: "Ledger not found" });

    const newAmount = Number(amount) || 0;
    
    // We only log if it's genuinely changed
    if (newAmount !== ledger.totalAmount) {
       ledger.activityLogs.push({
          message: `Total value was corrected from ₹${ledger.totalAmount} to ₹${newAmount}`
       });
       ledger.totalAmount = newAmount;
       await ledger.save();
    }

    res.status(200).json({ success: true, ledger });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating array" });
  }
};
