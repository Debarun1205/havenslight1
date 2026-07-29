const mongoose = require("mongoose");

const sosAlertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["active", "resolved", "false_alarm"],
      default: "active",
    },
    // GeoJSON Point — lets us later query "alerts near X" with a geospatial
    // index, which a generic {lat, lng} pair wouldn't support as cleanly.
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    // Snapshot of which contacts were notified at the moment the SOS fired —
    // deliberately not just a reference, since the user's contact list can
    // change later and we want a historical record of who was actually alerted.
    notifiedContacts: [
      {
        name: String,
        phone: String,
      },
    ],
    resolvedAt: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

sosAlertSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("SOSAlert", sosAlertSchema);
