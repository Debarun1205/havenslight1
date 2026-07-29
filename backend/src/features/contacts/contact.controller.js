const Contact = require("./contact.model");
const asyncHandler = require("../../utils/asyncHandler");

// @desc  List the logged-in user's emergency contacts
// @route GET /api/contacts
const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ user: req.user._id }).sort({ priority: 1 });
  res.json({ contacts });
});

// @desc  Add a new emergency contact
// @route POST /api/contacts
const addContact = asyncHandler(async (req, res) => {
  const { name, phone, relationship, priority } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: "Name and phone are required" });
  }

  const contact = await Contact.create({
    user: req.user._id,
    name,
    phone,
    relationship,
    priority,
  });

  res.status(201).json({ contact });
});

// @desc  Update an emergency contact
// @route PUT /api/contacts/:id
const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, user: req.user._id });
  if (!contact) {
    return res.status(404).json({ message: "Contact not found" });
  }

  const { name, phone, relationship, priority } = req.body;
  if (name !== undefined) contact.name = name;
  if (phone !== undefined) contact.phone = phone;
  if (relationship !== undefined) contact.relationship = relationship;
  if (priority !== undefined) contact.priority = priority;

  await contact.save();
  res.json({ contact });
});

// @desc  Delete an emergency contact
// @route DELETE /api/contacts/:id
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!contact) {
    return res.status(404).json({ message: "Contact not found" });
  }
  res.json({ message: "Contact removed" });
});

module.exports = { getContacts, addContact, updateContact, deleteContact };
