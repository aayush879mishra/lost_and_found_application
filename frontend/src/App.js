import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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

function App() {
  // 1. Initialize user from localStorage to prevent logout on refresh
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  console.log("APP USER STATE:", user);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If you wanted to verify the token with the backend, you'd do it here
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500 font-medium">
        Loading LostLink...
      </div>
    );
  }

  return (
    <>
    <Toaster position="top-center" reverseOrder={false} />

    <Router>
      {/* Navbar stays at the top and reacts to user state */}
      <Navbar user={user} setUser={setUser} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 min-h-screen">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup />} />

          {/* New OTP Route */}
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* --- ITEM ROUTES --- */}
          <Route path="/item/:type/:id" element={<ItemDetail user={user} />} />
          <Route path="/all-items" element={<AllItems />} />


          <Route path="/terms" element={<Terms />} />
<Route path="/privacy" element={<Privacy />} />
<Route path="/contact" element={<Contact />} />
<Route path="/help" element={<Help />} />

          {/* --- PROTECTED USER ROUTES --- */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                {/* Add setUser={setUser} here! */}
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

          {/* --- PROTECTED ADMIN ROUTE --- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} adminOnly={true}>
                <AdminDashboard user={user} />
              </ProtectedRoute>
            }
          />

          {/* <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} >
                <AdminDashboard  />
              </ProtectedRoute>
            }
          /> */}

          {/* --- FALLBACK --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
    </>
  );
}

export default App;
