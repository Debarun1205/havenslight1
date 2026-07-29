require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const setupSockets = require("./sockets/locationSocket");
const { startCheckInScheduler } = require("./features/checkin/checkin.scheduler");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "*" },
  });
  setupSockets(io);

  // Attached to the Express app so any controller can reach it via
  // req.app.get("io") without importing the socket module directly —
  // keeps feature modules decoupled from how realtime transport is wired up.
  app.set("io", io);

  startCheckInScheduler(io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
