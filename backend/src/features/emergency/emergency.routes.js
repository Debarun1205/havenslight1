const express = require("express");
const { getNearbyServices } = require("./emergency.controller");

const router = express.Router();

// Deliberately no auth — same reasoning as the doctor directory: finding
// the nearest police station or hospital shouldn't require logging in first.
router.get("/nearby", getNearbyServices);

module.exports = router;
