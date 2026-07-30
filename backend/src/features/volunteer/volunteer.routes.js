const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const {
  getMyStatus,
  optIn,
  optOut,
  setDuty,
  updateLocation,
  getNearby,
} = require("./volunteer.controller");

const router = express.Router();

router.use(protect);

router.get("/me", getMyStatus);
router.post("/opt-in", optIn);
router.post("/opt-out", optOut);
router.patch("/duty", setDuty);
router.patch("/location", updateLocation);
router.get("/nearby", getNearby);

module.exports = router;
