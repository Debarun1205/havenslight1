import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppShell from "./components/layout/AppShell";
import PublicLayout from "./components/layout/PublicLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SOS from "./pages/SOS";
import CheckIns from "./pages/CheckIns";
import Contacts from "./pages/Contacts";
import Doctors from "./pages/Doctors";
import EmergencyMap from "./pages/EmergencyMap";
import Translator from "./pages/Translator";
import Helpline from "./pages/Helpline";
import SelfDefense from "./pages/SelfDefense";
import Resources from "./pages/Resources";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Deliberately public — mirrors the backend's no-auth doctor route,
          since finding help in an emergency shouldn't require logging in first. */}
      <Route
        path="/find-a-doctor"
        element={
          <PublicLayout>
            <Doctors />
          </PublicLayout>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/sos" element={<SOS />} />
        <Route path="/checkins" element={<CheckIns />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/emergency-map" element={<EmergencyMap />} />
        <Route path="/translator" element={<Translator />} />
        <Route path="/helpline" element={<Helpline />} />
        <Route path="/self-defense" element={<SelfDefense />} />
        <Route path="/resources" element={<Resources />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
