const Doctor = require("./doctor.model");
const asyncHandler = require("../../utils/asyncHandler");

// @desc  Search/filter the doctor directory
// @route GET /api/doctors?city=&specialty=&language=
const searchDoctors = asyncHandler(async (req, res) => {
  const { city, specialty, language } = req.query;
  const query = {};

  if (city) query.city = new RegExp(`^${escapeRegex(city)}$`, "i");
  if (specialty) query.specialty = new RegExp(escapeRegex(specialty), "i");
  if (language) query.languagesSpoken = new RegExp(`^${escapeRegex(language)}$`, "i");

  const doctors = await Doctor.find(query).sort({ verified: -1, name: 1 }).limit(100);
  res.json({ count: doctors.length, doctors });
});

// @desc  Get a single doctor's detail
// @route GET /api/doctors/:id
const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }
  res.json({ doctor });
});

// Small helper so query params can't break the regex (e.g. a literal "(" in a search term).
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { searchDoctors, getDoctor };
