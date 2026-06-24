const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const cmsRoutes = require("./routes/cms.routes");
const leadRoutes = require("./routes/lead.routes");
const quotationRoutes = require("./routes/quotation.routes");
const bookingRoutes = require("./routes/booking.routes");
const teamRoutes = require("./routes/team.routes");
const assignmentRoutes = require("./routes/assignment.routes");
const taskRoutes = require("./routes/task.routes");
const paymentRoutes = require("./routes/payment.routes");
const notificationRoutes = require("./routes/notification.routes");
const albumRoutes = require("./routes/album.routes");
const ledgerRoutes = require("./routes/ledger.routes");
const expenseRoutes = require("./routes/expense.routes");
const analyticsRoutes = require("./routes/analytics.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;
