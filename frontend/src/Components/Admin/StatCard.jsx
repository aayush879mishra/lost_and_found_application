import React from "react";

const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
    </div>
    <h2 className="text-3xl font-black text-slate-900">{value}</h2>
  </div>
);

export default StatCard;