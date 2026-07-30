const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    relationship: { type: String, trim: true }, // e.g. "Mother", "Roommate", "Friend"
    // Priority order for escalation — lower number = contacted first.
    priority: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
