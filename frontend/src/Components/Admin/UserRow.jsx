import React from "react";

const UserRow = ({ user, onBlock, onDeleteUser }) => (
  <tr className="border-t border-slate-100 hover:bg-slate-50 transition">
    <td className="px-6 py-4">
      <div className="font-bold text-slate-800">{user.full_name}</div>
      <div className="text-xs text-slate-400">{user.email}</div>
    </td>
    <td className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{user.role}</td>
    <td className="px-6 py-4">
      <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
        user.is_blocked ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
      }`}>
        {user.is_blocked ? "Blocked" : "Active"}
      </span>
    </td>
    <td className="px-6 py-4 text-right space-x-3">
      {user.role !== "admin" && (
        <>
          <button 
            onClick={() => onBlock(user.user_id, user.is_blocked)} 
            className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition"
          >
            {user.is_blocked ? "Unblock" : "Block"}
          </button>
          <button 
            onClick={() => onDeleteUser(user.user_id)} 
            className="text-rose-500 hover:text-rose-700 transition"
          >
            🗑️
          </button>
        </>
      )}
    </td>
  </tr>
);

export default UserRow;