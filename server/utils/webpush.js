const webpush = require("web-push");

webpush.setVapidDetails(
  "mailto:mafpco.dev@gmail.com", // Found in env referencing admin email usually.
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.sendWebPush = async (subscription, data) => {
  const payload = JSON.stringify({
    title: data.title,
    message: data.message,
    url: data.redirectUrl || "/admin",
  });

  try {
    await webpush.sendNotification(subscription, payload);
  } catch (error) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      // The subscription has expired or is no longer valid
      console.log(`Subscription ${subscription.endpoint} deleted by the service provider.`);
      const Subscription = require("../models/Subscription.model");
      await Subscription.deleteOne({ endpoint: subscription.endpoint });
    } else {
      console.error("WebPush Error:", error);
    }
  }
};
