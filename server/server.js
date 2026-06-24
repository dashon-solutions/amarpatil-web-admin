require("dotenv").config();
const app = require("./app");
const http = require("http");
const connectDB = require("./config/db");
const socketModule = require("./socket");
const cron = require("node-cron");
const Reminder = require("./models/Reminder.model");
const Notification = require("./models/Notification.model");
const Subscription = require("./models/Subscription.model");
const webpushUtil = require("./utils/webpush");

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP Server and Wrap Express
const server = http.createServer(app);

// Initialize Socket.io
const io = socketModule.init(server);

// Init Cron Reminders
cron.schedule("* * * * *", async () => {
  const now = new Date();
  // Find reminders due now or past due that haven't been processed
  const reminders = await Reminder.find({ due: { $lte: now }, isProcessed: false });

  if (reminders.length > 0) {
    const admins = socketModule.getAdmins();
    for (const rem of reminders) {
      const notificationData = {
        title: "Reminder ⏰",
        message: rem.message,
        type: "reminder",
        redirectUrl: `/admin/reminders`, // you can update later if there is a reminder page
      };

      const savedNotif = await Notification.create(notificationData);

      admins.forEach(admin => {
        io.to(admin.socketId).emit("newNotification", savedNotif);
      });

      // Background Web Push Broadcast
      const subscriptions = await Subscription.find();
      Promise.all(subscriptions.map(sub => webpushUtil.sendWebPush(sub, notificationData)))
        .catch(err => console.error("Web Push broadcast issue on Reminder:", err));

      rem.isProcessed = true;
      await rem.save();
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
