const mongoose = require("mongoose");

const checkInSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, trim: true }, // e.g. "Meeting a stranger from a hostel group"
    dueAt: { type: Date, required: true, index: true }, // when the user must confirm safety by
    status: {
      type: String,
      enum: ["pending", "confirmed", "missed", "escalated"],
      default: "pending",
    },
    confirmedAt: { type: Date },
    lastKnownLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number] }, // [longitude, latitude], optional at creation
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CheckIn", checkInSchema);
