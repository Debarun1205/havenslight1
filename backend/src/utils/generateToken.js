const jwt = require("jsonwebtoken");

/**
 * Signs a JWT containing the user's ID. Kept as a single shared utility so
 * every feature that needs to issue or verify a token uses the same secret
 * and expiry logic, rather than each module reimplementing it slightly differently.
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
}

module.exports = generateToken;
