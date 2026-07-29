const express = require("express");
const {
  triggerSOS,
  updateSOSLocation,
  resolveSOS,
  getMyAlerts,
} = require("./sos.controller");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getMyAlerts);
router.post("/trigger", triggerSOS);
router.patch("/:id/location", updateSOSLocation);
router.patch("/:id/resolve", resolveSOS);

module.exports = router;
