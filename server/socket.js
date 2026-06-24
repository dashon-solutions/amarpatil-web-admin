const { Server } = require("socket.io");

let io;
let admins = [];

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: "*", // Adjust for production: ["http://localhost:5173", "https://yourdomain.com"]
        methods: ["GET", "POST"]
      }
    });

    io.on("connection", (socket) => {
      console.log("User connected (Socket):", socket.id);

      socket.on("registerAdmin", (adminId) => {
        // Prevent duplicate registers for same socket
        if (!admins.find(a => a.socketId === socket.id)) {
          admins.push({ adminId, socketId: socket.id });
          console.log(`Admin ${adminId} registered with Socket ${socket.id}`);
        }
      });

      socket.on("disconnect", () => {
        admins = admins.filter(a => a.socketId !== socket.id);
        console.log("User disconnected (Socket):", socket.id);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },

  getAdmins: () => admins,
};
