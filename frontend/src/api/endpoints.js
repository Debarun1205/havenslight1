import client from "./client";

// --- auth ---
export const registerUser = (data) => client.post("/auth/register", data);
export const loginUser = (data) => client.post("/auth/login", data);
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
