const SOSAlert = require("./sos.model");
const Contact = require("../contacts/contact.model");
const VolunteerProfile = require("../volunteer/volunteer.model");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSOSEmail } = require("../../utils/mailer");
const { SOS_ALERT_RADIUS_METERS } = require("../../config/constants");

// Finds on-duty volunteers near a point and returns them alongside distance,
// via $geoNear so results come back pre-sorted nearest-first — used both
// when an SOS first fires and (implicitly, via the stored snapshot) for
// every subsequent update to that same alert.
async function findNearbyVolunteers(coordinates, excludeUserId) {
  const results = await VolunteerProfile.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates },
        distanceField: "distanceMeters",
        maxDistance: SOS_ALERT_RADIUS_METERS,
        spherical: true,
        query: { onDuty: true, user: { $ne: excludeUserId } },
      },
    },
    { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userDoc" } },
    { $unwind: "$userDoc" },
  ]);

  return results.map((v) => ({
    volunteer: v.user,
    name: v.userDoc.name,
    distanceMeters: Math.round(v.distanceMeters),
  }));
}

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

  const notifiedVolunteers = await findNearbyVolunteers([longitude, latitude], req.user._id);

  const alert = await SOSAlert.create({
    user: req.user._id,
    location: { type: "Point", coordinates: [longitude, latitude] },
    notifiedContacts: contacts.map((c) => ({ name: c.name, phone: c.phone, email: c.email })),
    notifiedVolunteers,
  });

  // Real email dispatch to any contact who has one on file. Fired without
  // awaiting — an emergency response should never wait on a third-party
  // mail server, and a slow/failed send shouldn't block the person who just
  // triggered SOS from seeing their alert go live immediately. SMS/calls
  // are a separate follow-up (see README: requires DLT registration for
  // Indian numbers before any provider can legally send them).
  contacts
    .filter((c) => c.email)
    .forEach((c) => {
      sendSOSEmail({
        contact: { name: c.name, email: c.email },
        requesterName: req.user.name,
        location: alert.location,
        createdAt: alert.createdAt,
      }).catch((err) => console.error("SOS email dispatch error:", err.message));
    });

  const io = req.app.get("io");
  if (io) {
    io.to(`user:${req.user._id}`).emit("sos:triggered", { alert });

    // Nearby on-duty volunteers get the requester's exact location and
    // basic contact info — this is the one moment a volunteer sees a
    // user's precise position, deliberately scoped to only this alert.
    notifiedVolunteers.forEach((v) => {
      io.to(`user:${v.volunteer}`).emit("sos:nearby_alert", {
        alertId: alert._id,
        requester: { name: req.user.name, phone: req.user.phone },
        location: alert.location,
        distanceMeters: v.distanceMeters,
        createdAt: alert.createdAt,
      });
    });
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
    alert.notifiedVolunteers.forEach((v) => {
      io.to(`user:${v.volunteer}`).emit("sos:location_update", {
        alertId: alert._id,
        location: alert.location,
      });
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
    alert.notifiedVolunteers.forEach((v) => {
      io.to(`user:${v.volunteer}`).emit("sos:resolved", { alertId: alert._id, status: alert.status });
    });
  }

  res.json({ alert });
});

// @desc  Get the logged-in user's SOS alert history
// @route GET /api/sos
const getMyAlerts = asyncHandler(async (req, res) => {
  const alerts = await SOSAlert.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ alerts });
});

// @desc  Get active alerts the logged-in volunteer has been matched to —
//        covers the case where they weren't connected via socket at the
//        exact moment an SOS fired (app closed, page refreshed, etc.).
// @route GET /api/sos/nearby
const getNearbyAlerts = asyncHandler(async (req, res) => {
  const alerts = await SOSAlert.find({
    status: "active",
    "notifiedVolunteers.volunteer": req.user._id,
  })
    .populate("user", "name phone")
    .sort({ createdAt: -1 });

  res.json({
    alerts: alerts.map((a) => {
      const match = a.notifiedVolunteers.find((v) => String(v.volunteer) === String(req.user._id));
      return {
        alertId: a._id,
        requester: { name: a.user.name, phone: a.user.phone },
        location: a.location,
        distanceMeters: match?.distanceMeters,
        createdAt: a.createdAt,
      };
    }),
  });
});

module.exports = { triggerSOS, updateSOSLocation, resolveSOS, getMyAlerts, getNearbyAlerts };
