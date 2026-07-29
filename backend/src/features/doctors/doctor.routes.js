const express = require("express");
const { searchDoctors, getDoctor } = require("./doctor.controller");

const router = express.Router();

// Deliberately NOT behind auth middleware — in a medical emergency, someone
// shouldn't have to log in first to find a nearby doctor. Every other
// feature module (sos, checkin, contacts) requires auth; this one is the
// intentional exception.
router.get("/", searchDoctors);
router.get("/:id", getDoctor);

module.exports = router;
