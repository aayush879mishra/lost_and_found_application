import React from "react";

const ReportRow = ({ item, onDelete, onResolve }) => (
  <tr className="border-t border-slate-100 hover:bg-slate-50 transition">
    <td className="px-6 py-4 flex items-center gap-4">
      <img 
        src={item.image ? `http://localhost:5000${item.image}` : "https://placehold.co/100"} 
        className="w-10 h-10 rounded-lg object-cover" 
        alt={item.item_name} 
      />
      <div>
        <p className="font-bold text-slate-800">{item.item_name}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase">{item.location}</p>
      </div>
    </td>
    <td className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{item.type}</td>
    <td className="px-6 py-4">
      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
        item.status === "resolved" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
      }`}>
        {item.status}
      </span>
      {item.status !== "resolved" && (
        <div className="mt-1">
          <button 
            onClick={() => onResolve(item.type, item.id, item.status)} 
            className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 hover:underline transition"
          >
            Mark Resolve
          </button>
        </div>
      )}
    </td>
    <td className="px-6 py-4 text-right">
      <button 
        onClick={() => onDelete(item.type, item.id)} 
        className="text-rose-500 hover:text-rose-700 transition"
      >
        🗑️
      </button>
    </td>
  </tr>
);

export default ReportRow;