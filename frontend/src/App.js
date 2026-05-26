import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import { useState, useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from "./Components/Navbar";
import ProtectedRoute from "./Components/ProtectedRoutes"; 
import VerifyOTP from './Components/VerifyOTP';
import ForgotPassword from './Components/ForgotPassword';

// Pages
import Home from "./Pages/Home";
import Login from "./Pages/login";
import Signup from "./Pages/Signup";
import ReportLost from "./Pages/ReportLost";
import ReportFound from "./Pages/ReportFound";
import Profile from "./Pages/Profile";
import ItemDetail from "./Pages/ItemDetail";
import AdminDashboard from "./Pages/AdminDashboard";
import AllItems from "./Pages/AllItems";
import Terms from "./Pages/Terms";
import Privacy from "./Pages/Privacy";
import Contact from "./Pages/Contact";
import Help from "./Pages/Help";

function AppContent({ user, setUser }) {
  const location = useLocation();
  
  // Clean, reactive conditional check: Is the logged-in user an admin?
  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* 1. Show Navbar ONLY if the user is NOT an admin */}
      {!isAdmin && <Navbar user={user} setUser={setUser} />}

      {/* 2. Conditional Layout Rendering based on USER ROLE, not just path strings */}
      {isAdmin ? (
        /* ADMIN MODE: No main container padding, completely dedicated route tree */
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} adminOnly={true}>
                <AdminDashboard user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />
          {/* Catch-all for Admins: Redirects any page request (like '/') straight to the dashboard */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      ) : (
        /* USER MODE: Standard centered page container with padding */
        <main className="max-w-7xl mx-auto p-4 min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/all-items" element={<AllItems />} />
            <Route path="/item/:type/:id" element={<ItemDetail user={user} />} />
            
            {/* Info Routes */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<Help />} />

            {/* Protected User Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute user={user}>
                  <Profile user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-lost"
              element={
                <ProtectedRoute user={user}>
                  <ReportLost />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-found"
              element={
                <ProtectedRoute user={user}>
                  <ReportFound />
                </ProtectedRoute>
              }
            />

            {/* Protect /admin path if regular users manually type it into URL bar */}
            <Route path="/admin" element={<Navigate to="/login" replace />} />

            {/* Fallback for invalid public URLs */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      )}
    </>
  );
}

function App() {
  // Initialize user from localStorage to persist session on refresh
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated loading check (can be replaced with actual token verification)
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500 font-medium">
        <div className="animate-pulse">Loading LostLink...</div>
      </div>
    );
  }

  return (
    <>
      {/* Global Toast Notifications */}
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
          },
        }} 
      />

      <Router>
        <AppContent user={user} setUser={setUser} />
      </Router>
    </>
  );
}

export default App;