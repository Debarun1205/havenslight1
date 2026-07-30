const VolunteerProfile = require("./volunteer.model");
const asyncHandler = require("../../utils/asyncHandler");
const { VOLUNTEER_NEARBY_RADIUS_METERS } = require("../../config/constants");

async function getOrCreateProfile(userId) {
  let profile = await VolunteerProfile.findOne({ user: userId });
  if (!profile) {
    profile = await VolunteerProfile.create({ user: userId });
  }
  return profile;
}

// @desc  Get the logged-in user's own volunteer status
// @route GET /api/volunteer/me
const getMyStatus = asyncHandler(async (req, res) => {
  const profile = await getOrCreateProfile(req.user._id);
  res.json({ profile });
});

// @desc  Opt in to the guardian network. Does not turn on-duty on by
//        itself — opting in and going on duty are deliberately separate
//        steps, same as the toggle in the dashboard.
// @route POST /api/volunteer/opt-in
const optIn = asyncHandler(async (req, res) => {
  const profile = await getOrCreateProfile(req.user._id);
  profile.isVolunteer = true;
  await profile.save();
  res.json({ profile });
});

// @desc  Opt out entirely — also forces off-duty and clears location.
// @route POST /api/volunteer/opt-out
const optOut = asyncHandler(async (req, res) => {
  const profile = await getOrCreateProfile(req.user._id);
  profile.isVolunteer = false;
  profile.onDuty = false;
  profile.currentLocation = undefined;
  profile.locationUpdatedAt = undefined;
  await profile.save();
  res.json({ profile });
});

// @desc  Toggle on-duty status. Going on-duty requires an initial location;
//        going off-duty immediately clears the stored location — this is
//        the actual enforcement of "tracked only while on duty."
// @route PATCH /api/volunteer/duty
const setDuty = asyncHandler(async (req, res) => {
  const { onDuty, longitude, latitude } = req.body;

  const profile = await getOrCreateProfile(req.user._id);
  if (!profile.isVolunteer) {
    return res.status(403).json({ message: "Opt in to the guardian network before going on duty" });
  }

  if (onDuty) {
    if (longitude === undefined || latitude === undefined) {
      return res.status(400).json({ message: "longitude and latitude are required to go on duty" });
    }
    profile.onDuty = true;
    profile.currentLocation = { type: "Point", coordinates: [longitude, latitude] };
    profile.locationUpdatedAt = new Date();
  } else {
    profile.onDuty = false;
    profile.currentLocation = undefined;
    profile.locationUpdatedAt = undefined;
  }
  await profile.save();

  const io = req.app.get("io");
  if (io) {
    if (profile.onDuty) {
      io.to("public:volunteers").emit("volunteer:location_update", {
        volunteerId: profile.user,
        name: req.user.name,
        location: profile.currentLocation,
        updatedAt: profile.locationUpdatedAt,
      });
    } else {
      io.to("public:volunteers").emit("volunteer:offline", { volunteerId: profile.user });
    }
  }

  res.json({ profile });
});

// @desc  Push a location update while on duty. Rejected if not currently
//        on duty, so a stray background call can't silently start tracking.
// @route PATCH /api/volunteer/location
const updateLocation = asyncHandler(async (req, res) => {
  const { longitude, latitude } = req.body;
  if (longitude === undefined || latitude === undefined) {
    return res.status(400).json({ message: "longitude and latitude are required" });
  }

  const profile = await VolunteerProfile.findOne({ user: req.user._id });
  if (!profile || !profile.onDuty) {
    return res.status(400).json({ message: "You must be on duty to update location" });
  }

  profile.currentLocation = { type: "Point", coordinates: [longitude, latitude] };
  profile.locationUpdatedAt = new Date();
  await profile.save();

  const io = req.app.get("io");
  if (io) {
    io.to("public:volunteers").emit("volunteer:location_update", {
      volunteerId: profile.user,
      name: req.user.name,
      location: profile.currentLocation,
      updatedAt: profile.locationUpdatedAt,
    });
  }

  res.json({ profile });
});

// @desc  Find on-duty volunteers near a given point — powers the user's
//        live map. Returns only name + location + distance, never phone/
//        email, since a volunteer's contact details aren't public.
// @route GET /api/volunteer/nearby?longitude=&latitude=&radius=
const getNearby = asyncHandler(async (req, res) => {
  const { longitude, latitude } = req.query;
  const radius = Number(req.query.radius) || VOLUNTEER_NEARBY_RADIUS_METERS;

  if (longitude === undefined || latitude === undefined) {
    return res.status(400).json({ message: "longitude and latitude query params are required" });
  }

  const volunteers = await VolunteerProfile.find({
    onDuty: true,
    user: { $ne: req.user._id },
    currentLocation: {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
        $maxDistance: radius,
      },
    },
  })
    .populate("user", "name")
    .select("user currentLocation locationUpdatedAt verified");

  res.json({
    volunteers: volunteers.map((v) => ({
      volunteerId: v.user._id,
      name: v.user.name,
      location: v.currentLocation,
      updatedAt: v.locationUpdatedAt,
      verified: v.verified,
    })),
  });
});

module.exports = { getMyStatus, optIn, optOut, setDuty, updateLocation, getNearby };
