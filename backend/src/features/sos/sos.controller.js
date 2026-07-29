const SOSAlert = require("./sos.model");
const Contact = require("../contacts/contact.model");
const asyncHandler = require("../../utils/asyncHandler");

// @desc  Trigger a new SOS alert — snapshots the user's current emergency
//        contacts and broadcasts the alert over Socket.io.
// @route POST /api/sos/trigger
const triggerSOS = asyncHandler(async (req, res) => {
  const { longitude, latitude } = req.body;

  if (longitude === undefined || latitude === undefined) {
    return res.status(400).json({ message: "longitude and latitude are required" });
  }

  const contacts = await Contact.find({ user: req.user._id }).sort({ priority: 1 });
  if (contacts.length === 0) {
    return res.status(400).json({
      message: "No emergency contacts on file — add at least one contact before triggering SOS",
    });
  }

  const alert = await SOSAlert.create({
    user: req.user._id,
    location: { type: "Point", coordinates: [longitude, latitude] },
    notifiedContacts: contacts.map((c) => ({ name: c.name, phone: c.phone })),
  });

  // NOTE: this is where real SMS/call notification (e.g. Twilio) would be
  // wired in for production. The MVP records who *should* be notified and
  // broadcasts it in-app/over the socket connection; actual SMS dispatch is
  // a follow-up integration, not core SOS logic, so it's kept out of this
  // function to avoid coupling the alert model to a specific SMS provider.
  const io = req.app.get("io");
  if (io) {
    io.to(`user:${req.user._id}`).emit("sos:triggered", { alert });
  }

  res.status(201).json({ alert });
});

// @desc  Push a live location update for an active SOS alert
// @route PATCH /api/sos/:id/location
const updateSOSLocation = asyncHandler(async (req, res) => {
  const { longitude, latitude } = req.body;
  if (longitude === undefined || latitude === undefined) {
    return res.status(400).json({ message: "longitude and latitude are required" });
  }

  const alert = await SOSAlert.findOne({ _id: req.params.id, user: req.user._id, status: "active" });
  if (!alert) {
    return res.status(404).json({ message: "Active SOS alert not found" });
  }

  alert.location = { type: "Point", coordinates: [longitude, latitude] };
  await alert.save();

  const io = req.app.get("io");
  if (io) {
    io.to(`user:${req.user._id}`).emit("sos:location_update", {
      alertId: alert._id,
      location: alert.location,
    });
  }

  res.json({ alert });
});

// @desc  Resolve an active SOS alert
// @route PATCH /api/sos/:id/resolve
const resolveSOS = asyncHandler(async (req, res) => {
  const { falseAlarm, notes } = req.body;

  const alert = await SOSAlert.findOne({ _id: req.params.id, user: req.user._id });
  if (!alert) {
    return res.status(404).json({ message: "SOS alert not found" });
  }

  alert.status = falseAlarm ? "false_alarm" : "resolved";
  alert.resolvedAt = new Date();
  if (notes) alert.notes = notes;
  await alert.save();

  const io = req.app.get("io");
  if (io) {
    io.to(`user:${req.user._id}`).emit("sos:resolved", { alertId: alert._id, status: alert.status });
  }

  res.json({ alert });
});

// @desc  Get the logged-in user's SOS alert history
// @route GET /api/sos
const getMyAlerts = asyncHandler(async (req, res) => {
  const alerts = await SOSAlert.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ alerts });
});

module.exports = { triggerSOS, updateSOSLocation, resolveSOS, getMyAlerts };
