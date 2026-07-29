const jwt = require("jsonwebtoken");
const User = require("../features/auth/auth.model");

/**
 * Verifies the JWT from the Authorization header and attaches the user to
 * req.user. Every current and future feature module (sos, checkin, doctors,
 * and eventually guardian-network, explore-stay-dine) imports this same
 * middleware, so auth logic only ever lives in one place.
 */
async function protect(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token provided" });
}

module.exports = { protect };
