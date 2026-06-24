const Notification = require("../models/Notification.model");
const Subscription = require("../models/Subscription.model");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.status(200).json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications", error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });

    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update notification", error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update notifications", error: error.message });
  }
};

exports.saveSubscription = async (req, res) => {
  try {
    const subscriptionSource = req.body;
    
    // Check if the exact endpoint already exists
    let sub = await Subscription.findOne({ endpoint: subscriptionSource.endpoint });
    
    if (!sub) {
      sub = new Subscription(subscriptionSource);
      await sub.save();
    }
    
    res.status(200).json({ success: true, message: "Subscription saved successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to save subscription", error: error.message });
  }
};
