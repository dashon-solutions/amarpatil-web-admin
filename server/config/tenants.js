/**
 * Multi-Tenant Environment Configuration Map
 *
 * Keys are domain hostnames. Values are tenant-specific environments.
 * If a domain is not found, the server will refuse requests.
 * During development, localhost defaults to the first configured tenant.
 */
module.exports = {
  "amarpatil": {
    domains: [
      "amarpatil-web-admin-q7qq.vercel.app",
      "amarpatil-web-admin.vercel.app",
      "studio.dashonsolutions.com",
      "dashonsolutions.com",
    ],
    MONGODB_URI: "mongodb+srv://clientdeskteam_db_user:WDcf17sFy2efzPEq@amarpatilfinal.bzkt5bn.mongodb.net",
    ADMIN_EMAIL: "amarpatil@gmail.com",
    ADMIN_PASSWORD: "Dashon@2025",
    JWT_SECRET: "random#secret_amarpatil",
    CLOUDINARY_NAME: "dh8rylu0t",
    CLOUDINARY_API_KEY: "714392533423349",
    CLOUDINARY_SECRET_KEY: "Fuv6TEa8vw7GPBz6gfXJTflXfCg",
    MAIL_USER: "mafpco.dev@gmail.com",
    MAIL_PASS: "cyabxyxotlyzdgne",
    VAPID_PUBLIC_KEY: "BBCsqmILOOaUg6qCaT3nQK1iS3f-EU1Y4ObZ1oH6PGXPQ-0BYWkOiDqJhjkMImFJPEKioYJYKz3jwrayNSTTnXU",
    VAPID_PRIVATE_KEY: "XM_3LR3o4RZF0Pm79GoTqSQwsFUe3edkjX3nH3boVxs"
  },
  "skymotion": {
    domains: [
      "amarpatil2admin.vercel.app",
      "amarpatilwebsite2.vercel.app",
      "skymotiontest.vercel.app",
      "studioskymotion.dashonsolutions.com",
      "studioskymoto.dashonsolutions.com",
      "studioskymoto.dashonsolution.com",
    ],
    MONGODB_URI: "mongodb+srv://dashrathbshinde:dashrath@cluster0.xgxtuqr.mongodb.net/skymotionphotography-portfolio",
    ADMIN_EMAIL: "amarp.team@gmail.com",
    ADMIN_PASSWORD: "Dashon@2025",
    JWT_SECRET: "random#secret_skymotion",
    CLOUDINARY_NAME: "dussp84ou",
    CLOUDINARY_API_KEY: "178782314431291",
    CLOUDINARY_SECRET_KEY: "KbqaEbR2nH42ek0pSLf0J9NTPU8",
    MAIL_USER: "surwaseonkar12345@gmail.com",
    MAIL_PASS: "dupv qaby mkno gzbj",
    VAPID_PUBLIC_KEY: "BBCsqmILOOaUg6qCaT3nQK1iS3f-EU1Y4ObZ1oH6PGXPQ-0BYWkOiDqJhjkMImFJPEKioYJYKz3jwrayNSTTnXU",
    VAPID_PRIVATE_KEY: "XM_3LR3o4RZF0Pm79GoTqSQwsFUe3edkjX3nH3boVxs"
  }
};
