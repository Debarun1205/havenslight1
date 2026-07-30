const nodemailer = require("nodemailer");

// Provider-agnostic on purpose — works with a Gmail App Password, Outlook,
// or any real transactional email provider (SendGrid, Resend, etc. all
// expose SMTP credentials) just by changing env vars. No vendor lock-in,
// and no SMS-style regulatory registration required to get this working.
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null; // Not configured — callers handle this gracefully.
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true for port 465, false for 587/STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

// @param contact  { name, email }
// @param requesterName  the person who triggered SOS
// @param location  { coordinates: [lng, lat] }
async function sendSOSEmail({ contact, requesterName, location, createdAt }) {
  const t = getTransporter();
  if (!t || !contact.email) return { sent: false, reason: "not_configured_or_no_email" };

  const [lng, lat] = location.coordinates;
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const fromName = process.env.ALERT_FROM_NAME || "HavensLight";
  const fromEmail = process.env.ALERT_FROM_EMAIL || process.env.SMTP_USER;

  try {
    await t.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: contact.email,
      subject: `🚨 SOS Alert — ${requesterName} needs help`,
      text:
        `${requesterName} has triggered an emergency SOS alert on HavensLight.\n\n` +
        `Time: ${new Date(createdAt).toLocaleString()}\n` +
        `Their location: ${mapsUrl}\n\n` +
        `You are listed as one of their emergency contacts. Please try to reach them directly.`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <h2 style="color:#D64550;">🚨 SOS Alert</h2>
          <p><strong>${requesterName}</strong> has triggered an emergency SOS alert on HavensLight.</p>
          <p><strong>Time:</strong> ${new Date(createdAt).toLocaleString()}</p>
          <p><a href="${mapsUrl}" style="display:inline-block; background:#D64550; color:white; padding:10px 18px; border-radius:8px; text-decoration:none; font-weight:600;">View their location</a></p>
          <p style="color:#4E6773; font-size:13px;">You're listed as one of ${requesterName}'s emergency contacts. Please try to reach them directly.</p>
        </div>
      `,
    });
    return { sent: true };
  } catch (err) {
    console.error(`Failed to send SOS email to ${contact.email}:`, err.message);
    return { sent: false, reason: "send_failed" };
  }
}

module.exports = { sendSOSEmail };
