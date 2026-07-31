const { OAuth2Client } = require("google-auth-library");
const User = require("./auth.model");
const generateToken = require("../../utils/generateToken");
const asyncHandler = require("../../utils/asyncHandler");

const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

// @desc  Register a new user
// @route POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, preferredLanguage, homeState } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "An account with this email already exists" });
  }

  const user = await User.create({ name, email, password, phone, preferredLanguage, homeState });

  return res.status(201).json({
    user,
    token: generateToken(user._id),
  });
});

// @desc  Log in an existing user
// @route POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    // Deliberately vague — never reveal whether the email exists or the password was wrong.
    return res.status(401).json({ message: "Invalid email or password" });
  }

  return res.json({
    user,
    token: generateToken(user._id),
  });
});

// @desc  Get the logged-in user's own profile
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  return res.json({ user: req.user });
});

// @desc  Sign in (or sign up, on first use) with a Google ID token
// @route POST /api/auth/google
const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!googleClient) {
    return res.status(500).json({ message: "Google sign-in isn't configured on this server yet" });
  }
  if (!idToken) {
    return res.status(400).json({ message: "idToken is required" });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Google token" });
  }

  const { sub: googleId, email, name } = payload;

  // Match an existing account by googleId first, then by email — the
  // email match covers someone who registered with a password first and
  // is now linking Google sign-in to the same account.
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (!user) {
    user = await User.create({
      name: name || email.split("@")[0],
      email,
      authProvider: "google",
      googleId,
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    await user.save();
  }

  return res.json({
    user,
    token: generateToken(user._id),
  });
});

module.exports = { registerUser, loginUser, getMe, googleLogin };
