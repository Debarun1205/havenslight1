import client from "./client";

// --- auth ---
export const registerUser = (data) => client.post("/auth/register", data);
export const loginUser = (data) => client.post("/auth/login", data);
export const googleLogin = (idToken) => client.post("/auth/google", { idToken });
export const fetchMe = () => client.get("/auth/me");

// --- contacts ---
export const fetchContacts = () => client.get("/contacts");
export const createContact = (data) => client.post("/contacts", data);
export const updateContact = (id, data) => client.put(`/contacts/${id}`, data);
export const deleteContact = (id) => client.delete(`/contacts/${id}`);

// --- sos ---
export const fetchAlerts = () => client.get("/sos");
export const triggerSOS = (data) => client.post("/sos/trigger", data);
export const updateSOSLocation = (id, data) => client.patch(`/sos/${id}/location`, data);
export const resolveSOS = (id, data) => client.patch(`/sos/${id}/resolve`, data);

// --- check-ins ---
export const fetchCheckIns = () => client.get("/checkins");
export const createCheckIn = (data) => client.post("/checkins", data);
export const confirmCheckIn = (id) => client.patch(`/checkins/${id}/confirm`);

// --- doctors (no auth required) ---
export const searchDoctors = (params) => client.get("/doctors", { params });
export const fetchDoctor = (id) => client.get(`/doctors/${id}`);

// --- volunteer / guardian mode ---
export const fetchVolunteerStatus = () => client.get("/volunteer/me");
export const volunteerOptIn = () => client.post("/volunteer/opt-in");
export const volunteerOptOut = () => client.post("/volunteer/opt-out");
export const setVolunteerDuty = (data) => client.patch("/volunteer/duty", data);
export const updateVolunteerLocation = (data) => client.patch("/volunteer/location", data);
export const fetchNearbyVolunteers = (params) => client.get("/volunteer/nearby", { params });
export const fetchNearbySOSAlerts = () => client.get("/sos/nearby");

// --- emergency services (no auth required) ---
export const fetchNearbyEmergencyServices = (params) => client.get("/emergency/nearby", { params });

// --- translator (no auth required) ---
export const translateText = (data) => client.post("/translate", data);
