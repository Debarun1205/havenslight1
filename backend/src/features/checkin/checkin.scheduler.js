const CheckIn = require("./checkin.model");
const Contact = require("../contacts/contact.model");

const POLL_INTERVAL_MS = 60 * 1000; // check once a minute

/**
 * Finds check-ins that are still "pending" but past their due time, and
 * escalates them: marks the check-in missed, fetches the user's emergency
 * contacts, and emits a socket event (and logs, standing in for a real
 * SMS/call dispatch — see the same note in sos.controller.js).
 *
 * This is the actual automated safety mechanism behind the check-in
 * feature — without it, "check-ins" would just be a to-do list with no
 * real safety value.
 */
async function processOverdueCheckIns(io) {
  const overdue = await CheckIn.find({ status: "pending", dueAt: { $lte: new Date() } }).populate(
    "user",
    "name phone"
  );

  for (const checkIn of overdue) {
    checkIn.status = "escalated";
    await checkIn.save();

    const contacts = await Contact.find({ user: checkIn.user._id }).sort({ priority: 1 });

    console.warn(
      `[check-in escalation] User ${checkIn.user.name} (${checkIn.user._id}) missed a check-in ` +
        `("${checkIn.label || "unlabeled"}", due ${checkIn.dueAt.toISOString()}). ` +
        `Would notify ${contacts.length} contact(s): ${contacts.map((c) => c.name).join(", ") || "none on file"}.`
    );

    if (io) {
      io.to(`user:${checkIn.user._id}`).emit("checkin:escalated", {
        checkInId: checkIn._id,
        label: checkIn.label,
        dueAt: checkIn.dueAt,
        notifiedContacts: contacts.map((c) => ({ name: c.name, phone: c.phone })),
      });
    }
  }
}

/**
 * Starts the polling loop. Called once from server.js after the DB connects
 * and the Socket.io server exists.
 */
function startCheckInScheduler(io) {
  setInterval(() => {
    processOverdueCheckIns(io).catch((err) =>
      console.error("[check-in escalation] Error processing overdue check-ins:", err)
    );
  }, POLL_INTERVAL_MS);
  console.log("Check-in escalation scheduler started (polling every 60s).");
}

module.exports = { startCheckInScheduler, processOverdueCheckIns };
