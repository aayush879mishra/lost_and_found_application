import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clears token and user at once
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-[1001]">
      {/* 1️⃣ LOGO */}
      <h2 className="m-0">
        <Link to="/" className="text-2xl font-bold text-[#FF6B6B] no-underline tracking-tighter">
          LostLink
        </Link>
      </h2>

      {/* 2️⃣ CENTER MENU (Original Pill Style) */}
      <div className="hidden md:flex gap-4">
        <Link to="/" className="text-black no-underline border border-gray-300 px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-50 transition">
          Home
        </Link>
        <Link to="/all-items" className="text-black no-underline border border-gray-300 px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-50 transition">
          All Items
        </Link>
        <Link to="/report-lost" className="text-black no-underline border border-gray-300 px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-50 transition">
          Report Lost
        </Link>
        <Link to="/report-found" className="text-black no-underline border border-gray-300 px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-50 transition">
          Report Found
        </Link>
        
        {user?.role === "admin" && (
          <Link to="/admin" className="no-underline bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition">
            Admin Dashboard
          </Link>
        )}
      </div>

      {/* 3️⃣ AUTH BUTTONS */}
      <div className="flex gap-3 items-center">
        {!user ? (
          <>
            <Link to="/login" className="text-black no-underline border border-gray-300 px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-50 transition">
              Login
            </Link>
            <Link to="/signup" className="no-underline bg-[#FF6B6B] text-white px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition shadow-sm">
              Sign Up
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-4">
            {/* User Profile Link */}
            <Link to="/profile" className="flex items-center gap-2 text-gray-700 no-underline text-sm font-bold hover:text-[#FF6B6B] transition">
              <span className="bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full text-[10px]">👤</span>
              Hi, {user.full_name?.split(' ')[0]}
            </Link>
            
            {/* Sign Out (Original Style) */}
            <button 
              onClick={handleLogout} 
              className="border border-[#FF6B6B] text-[#FF6B6B] bg-transparent px-5 py-2 rounded-full text-sm font-semibold cursor-pointer hover:bg-[#FF6B6B] hover:text-white transition"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;