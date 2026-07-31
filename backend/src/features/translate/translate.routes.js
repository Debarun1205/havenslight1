const express = require("express");
const { translateText } = require("./translate.controller");

const router = express.Router();

// No auth — needing to communicate in an emergency shouldn't require login.
router.post("/", translateText);

module.exports = router;
