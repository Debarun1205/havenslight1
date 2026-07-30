const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    clinicName: { type: String, trim: true },
    specialty: { type: String, required: true, trim: true, index: true },
    city: { type: String, required: true, trim: true, index: true },
    address: { type: String, trim: true },
    // Languages spoken — the actual differentiator discussed in the product
    // plan: filter by ANY traveler's language, not just "English-speaking".
    languagesSpoken: { type: [String], default: [], index: true },
    phone: { type: String, trim: true },
    // Not available from most public directories (including Google Places) —
    // left optional rather than guessed at. Fill in manually as clinics are
    // contacted directly, or when a clinic submits their own listing.
    email: { type: String, trim: true, lowercase: true },
    // Transparent pricing where available — a direct answer to the itch-100
    // problem statement ("clear costs").
    consultationFeeINR: { type: Number },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number] }, // [longitude, latitude]
    },
    source: {
      type: String,
      enum: ["seed_demo", "government_directory", "google_places", "user_submitted"],
      default: "seed_demo",
    },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

doctorSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Doctor", doctorSchema);
