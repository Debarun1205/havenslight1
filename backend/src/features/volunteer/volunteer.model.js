const mongoose = require("mongoose");

const volunteerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },

    // Whether this person has opted in to the guardian network at all.
    // Separate from onDuty so someone can be a registered volunteer who's
    // currently off-duty, rather than losing their status every time they
    // close the app.
    isVolunteer: { type: Boolean, default: false },

    // Deliberately NOT "always tracked" — location is only stored while this
    // is true, and is cleared the moment the volunteer goes off duty. This
    // is the enforcement point for the on-duty-only tracking model.
    onDuty: { type: Boolean, default: false },

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined,
      },
    },
    locationUpdatedAt: { type: Date },

    // Lightweight verification flag for the "verified guardian network"
    // claim — starts false; a real verification workflow (ID check, phone
    // OTP, background check) is a future addition, not core to this MVP.
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

volunteerProfileSchema.index({ currentLocation: "2dsphere" });

module.exports = mongoose.model("VolunteerProfile", volunteerProfileSchema);
