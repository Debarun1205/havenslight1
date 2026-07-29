const CheckIn = require("./checkin.model");
const asyncHandler = require("../../utils/asyncHandler");

// @desc  Schedule a new check-in
// @route POST /api/checkins
const createCheckIn = asyncHandler(async (req, res) => {
  const { label, dueAt, longitude, latitude } = req.body;

  if (!dueAt) {
    return res.status(400).json({ message: "dueAt (ISO datetime) is required" });
  }
  if (new Date(dueAt) <= new Date()) {
    return res.status(400).json({ message: "dueAt must be in the future" });
  }

  const checkIn = await CheckIn.create({
    user: req.user._id,
    label,
    dueAt,
    lastKnownLocation:
      longitude !== undefined && latitude !== undefined
        ? { type: "Point", coordinates: [longitude, latitude] }
        : undefined,
  });

  res.status(201).json({ checkIn });
});

// @desc  Confirm a check-in (mark yourself safe)
// @route PATCH /api/checkins/:id/confirm
const confirmCheckIn = asyncHandler(async (req, res) => {
  const checkIn = await CheckIn.findOne({ _id: req.params.id, user: req.user._id });
  if (!checkIn) {
    return res.status(404).json({ message: "Check-in not found" });
  }
  if (checkIn.status !== "pending") {
    return res.status(400).json({ message: `Check-in already ${checkIn.status}` });
  }

  checkIn.status = "confirmed";
  checkIn.confirmedAt = new Date();
  await checkIn.save();

  res.json({ checkIn });
});

// @desc  List the logged-in user's check-ins
// @route GET /api/checkins
const getMyCheckIns = asyncHandler(async (req, res) => {
  const checkIns = await CheckIn.find({ user: req.user._id }).sort({ dueAt: -1 });
  res.json({ checkIns });
});

module.exports = { createCheckIn, confirmCheckIn, getMyCheckIns };
