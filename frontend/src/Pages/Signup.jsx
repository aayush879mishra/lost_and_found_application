import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import logo from "../assets/logo.jpeg";

function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  /* ================= NORMAL SIGNUP ================= */
  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!fullName || !email || !password || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Signup failed");
        return;
      }

      setMessage("Signup successful! Redirecting...");
      setTimeout(() => navigate("/Login"), 1200);
    } catch (err) {
      setMessage("Server error. Please try again.");
    }
  };

  /* ================= GOOGLE SIGNUP ================= */
  const handleGoogleSignup = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        setMessage("Google signup failed");
        return;
      }

      const res = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Google signup failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // Store user data
      navigate("/"); // Navigate home after social login
    } catch (err) {
      console.error(err);
      setMessage("Google signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#F8EDEB] to-[#E9F7D8] flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl text-center">
        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="LostLink Logo" className="w-28" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h2>

        {/* GOOGLE BUTTON */}
        <div className="flex justify-center mb-4">
          <GoogleLogin
            onSuccess={handleGoogleSignup}
            onError={() => setMessage("Google signup failed")}
          />
        </div>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 font-bold text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B6B]/50 transition"
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B6B]/50 transition"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B6B]/50 transition"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B6B]/50 transition"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button 
            type="submit" 
            className="w-full py-3 bg-[#FF6B6B] hover:bg-[#ff5252] text-white font-bold rounded-lg text-lg transition-colors shadow-md active:scale-95"
          >
            Sign Up
          </button>
        </form>

        {/* MESSAGES */}
        {message && (
          <p className={`mt-4 text-sm font-medium ${message.includes("successful") ? "text-green-600" : "text-red-500"}`}>
            {message}
          </p>
        )}

        <p className="mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/Login" className="text-[#FF6B6B] font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;