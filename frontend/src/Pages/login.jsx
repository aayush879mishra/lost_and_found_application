import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import logo from "../assets/logo.jpeg";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("All fields are required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      // Store auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Update global state in App.js
      setUser(data.user);
      
      navigate("/");
    } catch (error) {
      console.error(error);
      setMessage("Server error. Please try again later.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Google login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setUser(data.user);
      navigate("/");
    } catch {
      setMessage("Google login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#F8EDEB] to-[#E9F7D8] flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl text-center">
        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="LostLink Logo" className="w-28" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back</h2>

        {/* GOOGLE LOGIN */}
        <div className="flex justify-center mb-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setMessage("Google login failed")}
          />
        </div>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-400 font-bold text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="text-left">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B6B]/50 transition"
            />
          </div>

          <div className="text-left">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#FF6B6B]/50 transition"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 mt-2 bg-[#FF6B6B] hover:bg-[#ff5252] text-white font-bold rounded-lg text-lg transition-all shadow-md active:scale-95"
          >
            Login
          </button>
        </form>

        {/* MESSAGE */}
        {message && (
          <p className="mt-4 text-sm font-medium text-red-500 bg-red-50 p-2 rounded border border-red-100">
            {message}
          </p>
        )}

        <p className="mt-8 text-sm text-gray-600">
          New user?{" "}
          <Link to="/signup" className="text-[#FF6B6B] font-bold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;