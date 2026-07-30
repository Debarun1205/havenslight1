// Centralized so the "nearby" radius used by the live map and the (larger)
// radius used to summon rescuers during an actual SOS can be tuned in one
// place without hunting through controllers.
module.exports = {
  // How far a user's live map looks for on-duty volunteers to display.
  VOLUNTEER_NEARBY_RADIUS_METERS: Number(process.env.VOLUNTEER_NEARBY_RADIUS_METERS) || 3000,
  // Wider net cast when an SOS actually fires — deliberately larger than the
  // map-display radius so a rescuer a few minutes further out still gets pulled in.
  SOS_ALERT_RADIUS_METERS: Number(process.env.SOS_ALERT_RADIUS_METERS) || 5000,
};
