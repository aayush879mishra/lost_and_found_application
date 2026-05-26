import React from "react";

const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
      active 
        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`}
  >
    <span className="text-lg">{icon}</span> {label}
  </button>
);

export default NavItem;