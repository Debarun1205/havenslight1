const express = require("express");
const { registerUser, loginUser, getMe, googleLogin } = require("./auth.controller");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.get("/me", protect, getMe);

module.exports = router;
