const User = require("./auth.model");
const generateToken = require("../../utils/generateToken");
const asyncHandler = require("../../utils/asyncHandler");

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

module.exports = { registerUser, loginUser, getMe };
