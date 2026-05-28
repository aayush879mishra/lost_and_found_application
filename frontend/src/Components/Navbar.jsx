import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, User, LayoutDashboard, MessageSquare } from "lucide-react";
import socket from "../socket"; // Import your central socket engine link

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    socket.disconnect(); // Clear socket stream pipeline on logout
    navigate("/login");
  };

  // Helper to highlight active link
  const isActive = (path) => location.pathname === path;

  // Global socket background listener for live notifications
useEffect(() => {
  if (!user) return;

  // FORCEFUL CONNECTION: Make sure the pipe is wide open
  if (!socket.connected) {
    socket.connect();
  }

  // Debugging helper: Let's log to see if this user instance is actually listening
  console.log("Navbar listening for live notifications for user:", user.user_id);

  const handleGlobalNotifications = (newMsg) => {
    console.log("Global message packet caught by Navbar:", newMsg); // Check if data arrives

    const isViewingInbox = location.pathname === "/inbox";
    
    // Convert both IDs to Numbers to prevent string vs integer comparison mismatches
    if (Number(newMsg.sender_id) !== Number(user.user_id)) {
      if (!isViewingInbox) {
        setUnreadCount((prev) => prev + 1);
      }
    }
  };

  socket.on("receive_message", handleGlobalNotifications);

  return () => {
    socket.off("receive_message", handleGlobalNotifications);
  };
}, [user, location.pathname]);

  // Clear unread counts instantly whenever the user clicks to enter their inbox channel workspace
  useEffect(() => {
    if (location.pathname === "/inbox") {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  return (
    <nav className="bg-white/80 backdrop-blur-md px-8 py-5 flex justify-between items-center border-b border-gray-100 sticky top-0 z-[1001]">
      
      {/* BRAND LOGO */}
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-black text-[#4F46E5] no-underline tracking-tighter hover:opacity-80 transition">
          LostLink
        </Link>

        {/* CENTER MENU */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { name: "Browse Items", path: "/all-items" },
            { name: "Report Lost", path: "/report-lost" },
            { name: "Report Found", path: "/report-found" },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-bold no-underline transition-all ${
                isActive(item.path)
                  ? "text-[#4F46E5] relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-[#4F46E5]"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* AUTH ACTIONS */}
      <div className="flex gap-4 items-center">
        {!user ? (
          <>
            <Link 
              to="/login" 
              className="text-[#111827] no-underline text-sm font-black hover:opacity-70 transition px-4"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="no-underline bg-[#4F46E5] text-white px-7 py-3 rounded-2xl text-sm font-black hover:bg-[#4338CA] transition shadow-[0_10px_20px_rgba(79,70,229,0.15)] active:scale-95"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-6">
            {user?.role === "admin" && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 text-[#111827] no-underline text-sm font-black hover:text-[#4F46E5] transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}

            {/* Global In-App Messages Entry Point with Pending Alert Counters */}
            <Link 
              to="/inbox" 
              className={`flex items-center gap-2 no-underline text-sm font-black transition relative ${
                isActive("/inbox")
                  ? "text-[#4F46E5]"
                  : "text-[#111827] hover:text-[#4F46E5]"
              }`}
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-2xl transition relative ${
                isActive("/inbox") ? "bg-[#EEF2FF]" : "bg-[#F3F4F6] hover:bg-[#EEF2FF]"
              }`}>
                <MessageSquare className={`w-5 h-5 ${isActive("/inbox") ? "text-[#4F46E5]" : "text-[#6B7280]"}`} />
                
                {/* DYNAMIC NOTIFICATION BADGE COUNTER ACCENT */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#E11D48] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white animate-bounce shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline">Inbox</span>
            </Link>

            {/* User Profile */}
            <Link 
              to="/profile" 
              className="flex items-center gap-3 text-[#111827] no-underline text-sm font-black hover:text-[#4F46E5] transition group"
            >
              <div className="bg-[#F3F4F6] w-10 h-10 flex items-center justify-center rounded-2xl group-hover:bg-[#EEF2FF] transition">
                <User className="w-5 h-5 text-[#6B7280] group-hover:text-[#4F46E5]" />
              </div>
              <span className="hidden sm:inline">Hi, {user.full_name?.split(' ')[0]}</span>
            </Link>
            
            <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>

            {/* Logout */}
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-[#6B7280] bg-transparent border-none p-0 text-sm font-black cursor-pointer hover:text-[#E11D48] transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;