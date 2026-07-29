const express = require("express");
const { getContacts, addContact, updateContact, deleteContact } = require("./contact.controller");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

router.use(protect); // every contacts route requires auth

router.route("/").get(getContacts).post(addContact);
router.route("/:id").put(updateContact).delete(deleteContact);

module.exports = router;
