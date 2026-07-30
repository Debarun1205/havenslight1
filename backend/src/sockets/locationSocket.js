const jwt = require("jsonwebtoken");

/**
 * Sets up Socket.io: authenticates each connection with the same JWT used
 * for REST requests, then joins the socket to a per-user room so events
 * (sos:triggered, sos:location_update, checkin:escalated) can be targeted
 * at exactly the right user/trusted-circle without broadcasting globally.
 *
 * Future features (guardian network, live tracking shared with a guardian)
 * can reuse these same rooms rather than building a separate realtime layer.
 */
function setupSockets(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
    // Any connected client can receive volunteer location broadcasts — only
    // rendered on-screen when that client's dashboard is in User Mode. The
    // data itself carries no sensitive info beyond a volunteer's own
    // position while they're deliberately on duty.
    socket.join("public:volunteers");
    console.log(`Socket connected for user ${socket.userId}`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected for user ${socket.userId}`);
    });
  });
}

module.exports = setupSockets;
