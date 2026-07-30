const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./features/auth/auth.routes");
const contactRoutes = require("./features/contacts/contact.routes");
const sosRoutes = require("./features/sos/sos.routes");
const checkinRoutes = require("./features/checkin/checkin.routes");
const doctorRoutes = require("./features/doctors/doctor.routes");
const volunteerRoutes = require("./features/volunteer/volunteer.routes");
const emergencyRoutes = require("./features/emergency/emergency.routes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Each feature module owns its own routes, model, and controller — adding a
// new feature (e.g. guardian network, explore/stay/dine) later means adding
// one new require + app.use line here, without touching any existing route.
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/checkins", checkinRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/emergency", emergencyRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
