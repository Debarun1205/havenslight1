/**
 * Seeds the doctor directory. Run with:
 *   node src/features/doctors/doctor.seed.js
 *
 * Two data sets, clearly labeled by source:
 *  - realDoctors: real, verifiable clinics pulled from Google Places
 *    (name, address, phone, coordinates are genuine business-listing data).
 *    languagesSpoken and consultationFeeINR are intentionally left empty —
 *    that information isn't available from Places and is NOT guessed at.
 *    Fill those in as clinics are contacted directly.
 *  - demoDoctors: placeholder data for cities not yet covered by real
 *    listings, so the directory still has some coverage everywhere while
 *    the real dataset grows city by city.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../../config/db");
const Doctor = require("./doctor.model");

const realDoctors = [
  {
    name: "Dr. Harish K V",
    clinicName: "Hansaa Clinic",
    specialty: "General Physician",
    city: "Bengaluru",
    address: "1181, 12th B Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560008",
    languagesSpoken: [],
    phone: "+91 95358 09204",
    location: { type: "Point", coordinates: [77.6422631, 12.9689722] },
    source: "google_places",
    verified: false,
  },
  {
    name: "Mohan's Clinic",
    clinicName: "Mohan's Clinic",
    specialty: "General Physician",
    city: "Bengaluru",
    address: "613, 2nd Main Rd, First Stage, Indiranagar, Bengaluru, Karnataka 560038",
    languagesSpoken: [],
    phone: "+91 80 4164 4187",
    location: { type: "Point", coordinates: [77.6399048, 12.982557] },
    source: "google_places",
    verified: false,
  },
  {
    name: "Clinikk Health Hub",
    clinicName: "Clinikk Health Hub Koramangala",
    specialty: "General Physician",
    city: "Bengaluru",
    address: "2, Ground Floor, Jai Plaza, 80 Feet Rd, 1st Block Koramangala, Bengaluru, Karnataka 560034",
    languagesSpoken: [],
    phone: "+91 80 6830 1233",
    location: { type: "Point", coordinates: [77.6336, 12.9261126] },
    source: "google_places",
    verified: false,
  },
  {
    name: "UltraCare Diagnostic Centre",
    clinicName: "UltraCare Diagnostic Centre",
    specialty: "General Physician",
    city: "Mumbai",
    address: "Shop No. 6, 25th Rd, Bandra West, Mumbai, Maharashtra 400050",
    languagesSpoken: [],
    phone: "+91 93219 82674",
    location: { type: "Point", coordinates: [72.8333849, 19.0609014] },
    source: "google_places",
    verified: false,
  },
  {
    name: "Dr. Mitossh Ruparel",
    clinicName: "Harmony Clinic",
    specialty: "General Physician",
    city: "Mumbai",
    address: "302, 3rd Floor, Silver Pearl, Waterfield Rd & 30th Rd, Bandra West, Mumbai, Maharashtra 400050",
    languagesSpoken: [],
    phone: "+91 87799 67799",
    location: { type: "Point", coordinates: [72.8348459, 19.0620833] },
    source: "google_places",
    verified: false,
  },
  {
    name: "Doctors House",
    clinicName: "Doctors House - CP",
    specialty: "Orthopedic",
    city: "Delhi",
    address: "B2, Jantar Mantar Rd, opp. Kerala House, Janpath, Connaught Place, New Delhi 110001",
    languagesSpoken: [],
    phone: "+91 93102 85558",
    location: { type: "Point", coordinates: [77.2155827, 28.6232118] },
    source: "google_places",
    verified: false,
  },
  {
    name: "Dr. Suhani",
    clinicName: "General Williams Masonic Polyclinic",
    specialty: "Dentist",
    city: "Delhi",
    address: "Freemasons Hall, Tolstoy Rd, Janpath, Connaught Place, New Delhi 110001",
    languagesSpoken: [],
    phone: "+91 11 4601 6321",
    location: { type: "Point", coordinates: [77.2182562, 28.6267126] },
    source: "google_places",
    verified: false,
  },
];

// Placeholder coverage for cities not yet backed by real listings.
const demoDoctors = [
  {
    name: "Dr. Meera Nair",
    clinicName: "Kochi Wellness Center",
    specialty: "General Physician",
    city: "Kochi",
    address: "MG Road, Kochi",
    languagesSpoken: ["English", "Malayalam", "Tamil", "Hindi"],
    phone: "+91-484-400-3000",
    consultationFeeINR: 450,
    location: { type: "Point", coordinates: [76.2673, 9.9312] },
  },
  {
    name: "Dr. Aritra Sengupta",
    clinicName: "Kolkata Health Point",
    specialty: "General Physician",
    city: "Kolkata",
    address: "Park Street, Kolkata",
    languagesSpoken: ["English", "Bengali", "Hindi"],
    phone: "+91-33-4000-4000",
    consultationFeeINR: 400,
    location: { type: "Point", coordinates: [88.3639, 22.5726] },
  },
  {
    name: "Dr. Priya Reddy",
    clinicName: "Hyderabad Traveler's Clinic",
    specialty: "General Physician",
    city: "Hyderabad",
    address: "Banjara Hills, Hyderabad",
    languagesSpoken: ["English", "Telugu", "Hindi", "Urdu"],
    phone: "+91-40-4000-5000",
    consultationFeeINR: 550,
    location: { type: "Point", coordinates: [78.4483, 17.4126] },
  },
  {
    name: "Dr. Nabanita Das",
    clinicName: "Guwahati Health Hub",
    specialty: "General Physician",
    city: "Guwahati",
    address: "Fancy Bazaar, Guwahati",
    languagesSpoken: ["English", "Assamese", "Bengali", "Hindi"],
    phone: "+91-361-400-7000",
    consultationFeeINR: 400,
    location: { type: "Point", coordinates: [91.7362, 26.1445] },
  },
  {
    name: "Dr. Kavita Joshi",
    clinicName: "Goa Coastal Clinic",
    specialty: "General Physician",
    city: "Goa",
    address: "Panaji, Goa",
    languagesSpoken: ["English", "Konkani", "Hindi", "Portuguese"],
    phone: "+91-832-400-8000",
    consultationFeeINR: 500,
    location: { type: "Point", coordinates: [73.8278, 15.4909] },
  },
];

async function seed() {
  await connectDB();
  await Doctor.deleteMany({ source: { $in: ["seed_demo", "google_places"] } });
  await Doctor.insertMany(realDoctors);
  await Doctor.insertMany(demoDoctors.map((d) => ({ ...d, source: "seed_demo", verified: true })));
  console.log(
    `Seeded ${realDoctors.length} real (Google Places) doctors and ${demoDoctors.length} demo-placeholder doctors.`
  );
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

