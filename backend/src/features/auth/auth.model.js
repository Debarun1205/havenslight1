const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Only required for accounts created with email+password — Google
    // sign-in accounts authenticate via Google's own token verification
    // and never have a local password at all.
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      minlength: 8,
    },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String, unique: true, sparse: true },
    phone: { type: String, trim: true },
    // preferredLanguage drives phrasebook + doctor language-matching later —
    // stored on the user now so those future features have zero migration cost.
    preferredLanguage: { type: String, default: "en" },
    homeState: { type: String, trim: true },
  },
  { timestamps: true }
);

// Hash the password before saving, but only if it was actually changed —
// otherwise every unrelated profile update would re-hash an already-hashed password.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Never send the password hash back in API responses.
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
