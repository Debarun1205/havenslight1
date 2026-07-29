/**
 * Seeds the doctor directory with realistic demo data. Run with:
 *   node src/features/doctors/doctor.seed.js
 *
 * This is clearly demo/placeholder data (source: "seed_demo") — see the
 * README's note on honestly labeling prototype data vs. real sourced data
 * (government directories / Google Places, per the product plan).
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../../config/db");
const Doctor = require("./doctor.model");

const demoDoctors = [
  {
    name: "Dr. Ananya Krishnan",
    clinicName: "Sunrise Family Clinic",
    specialty: "General Physician",
    city: "Bengaluru",
    address: "Indiranagar, Bengaluru",
    languagesSpoken: ["English", "Kannada", "Tamil", "Hindi"],
    phone: "+91-80-4000-1000",
    consultationFeeINR: 500,
    location: { type: "Point", coordinates: [77.6408, 12.9719] },
    verified: true,
  },
  {
    name: "Dr. Rohan Mehta",
    clinicName: "CityCare Urgent Clinic",
    specialty: "Emergency Medicine",
    city: "Mumbai",
    address: "Bandra West, Mumbai",
    languagesSpoken: ["English", "Hindi", "Gujarati", "Marathi"],
    phone: "+91-22-4000-2000",
    consultationFeeINR: 800,
    location: { type: "Point", coordinates: [72.8296, 19.0596] },
    verified: true,
  },
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
    verified: true,
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
    verified: true,
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
    verified: true,
  },
  {
    name: "Dr. Simran Kaur",
    clinicName: "Delhi Emergency Care",
    specialty: "Emergency Medicine",
    city: "Delhi",
    address: "Connaught Place, Delhi",
    languagesSpoken: ["English", "Hindi", "Punjabi"],
    phone: "+91-11-4000-6000",
    consultationFeeINR: 700,
    location: { type: "Point", coordinates: [77.2167, 28.6315] },
    verified: true,
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
    verified: true,
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
    verified: true,
  },
];

async function seed() {
  await connectDB();
  await Doctor.deleteMany({ source: "seed_demo" });
  await Doctor.insertMany(demoDoctors.map((d) => ({ ...d, source: "seed_demo" })));
  console.log(`Seeded ${demoDoctors.length} demo doctors.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
