import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Home from '@/pages/Home';
import GuardianCircle from '@/pages/GuardianCircle';
import SOS from '@/pages/SOS';
import CheckIns from '@/pages/CheckIns';
import SafeMapPage from '@/pages/SafeMap';
import Doctors from '@/pages/Doctors';
import EmergencyServices from '@/pages/EmergencyServices';
import Communication from '@/pages/Communication';
import { ModeProvider } from '@/components/ModeContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Notifications from '@/pages/Notifications';
import Translator from '@/pages/Translator';
import SafetyGuides from '@/pages/SafetyGuides';
import Profile from '@/pages/Profile';
import HelplineDirectory from '@/pages/HelplineDirectory';
import SafetyDashboard from '@/pages/SafetyDashboard';
import DocumentLocker from '@/pages/DocumentLocker';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle user-not-registered error specifically
  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Render the app — auth pages are public, everything else is protected
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/" element={<Home />} />
        <Route path="/sos" element={<SOS />} />
        <Route path="/guardian-circle" element={<GuardianCircle />} />
        <Route path="/check-ins" element={<CheckIns />} />
        <Route path="/safe-map" element={<SafeMapPage />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/emergency-services" element={<EmergencyServices />} />
        <Route path="/communicate" element={<Communication />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/translator" element={<Translator />} />
        <Route path="/safety-guides" element={<SafetyGuides />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/helpline-directory" element={<HelplineDirectory />} />
        <Route path="/safety-dashboard" element={<SafetyDashboard />} />
        <Route path="/document-locker" element={<DocumentLocker />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <ModeProvider>
            <AuthenticatedApp />
          </ModeProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App