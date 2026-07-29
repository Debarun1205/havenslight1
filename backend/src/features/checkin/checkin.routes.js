const express = require("express");
const { createCheckIn, confirmCheckIn, getMyCheckIns } = require("./checkin.controller");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").get(getMyCheckIns).post(createCheckIn);
router.patch("/:id/confirm", confirmCheckIn);

module.exports = router;
