import React from "react";
import { MapPin, Calendar, Tag, Phone, User } from "lucide-react";

const PendingRow = ({ item, onAction }) => {
  const id = item.lost_id || item.found_id;

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50/80 transition duration-200">
      {/* COLUMN 1: IMAGE & METADATA */}
      <td className="px-6 py-5 align-top w-1/4">
        <div className="flex gap-4">
          <div className="relative shrink-0">
            <img 
              src={item.image ? `http://localhost:5000${item.image}` : "https://placehold.co/150"} 
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm" 
              alt={item.item_name} 
            />
            <span className={`absolute -top-2 -left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-sm ${
              item.item_type === 'lost' ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'
            }`}>
              {item.item_type}
            </span>
          </div>
          <div className="space-y-1">
            <p className="font-extrabold text-slate-900 text-base leading-snug">{item.item_name}</p>
            <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" /> {item.location}
            </p>
            <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" /> {item.category || "General"}
            </p>
          </div>
        </div>
      </td>

      {/* COLUMN 2: DESCRIPTION PREVIEW */}
      <td className="px-6 py-5 align-top max-w-xs">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Item Details</p>
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 whitespace-pre-line break-words" title={item.description}>
          {item.description || "No detailed description provided by the user."}
        </p>
      </td>

      
      {/* COLUMN 3: SUBMITTER INFO */}
<td className="px-6 py-5 align-top whitespace-nowrap">
  <div className="space-y-1.5 text-xs font-semibold text-slate-700">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Submitter</p>
    
    {/* Explicitly showing full name now with a fallback to user_id */}
    <p className="flex items-center gap-1.5 text-slate-900 font-bold">
      <User className="w-3.5 h-3.5 text-slate-500 shrink-0" /> 
      {item.full_name || `User ID: ${item.user_id}`}
    </p>
    
    <p className="flex items-center gap-1.5 text-slate-600">
  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 
  {/* Reads the exact contact number filled out in the post form */}
  {item.phone || "No Contact Number"}
</p>
    
    {item.created_at && (
      <p className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-1 font-medium">
        <Calendar className="w-3.5 h-3.5" /> 
        {new Date(item.created_at).toLocaleDateString()}
      </p>
    )}
  </div>
</td>
      {/* COLUMN 4: ACTION BUTTONS */}
      <td className="px-6 py-5 align-top text-right whitespace-nowrap w-40">
        <div className="flex flex-col sm:flex-row gap-2 justify-end pt-1">
          <button 
            onClick={() => onAction(id, item.item_type, 'rejected')} 
            className="w-full sm:w-auto bg-rose-50 text-rose-600 border border-rose-200 text-xs px-3.5 py-2 rounded-xl font-bold hover:bg-rose-100/70 transition-all active:scale-95 shadow-sm"
          >
            Reject
          </button>
          <button 
            onClick={() => onAction(id, item.item_type, 'approved')} 
            className="w-full sm:w-auto bg-emerald-500 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-sm hover:shadow-emerald-100"
          >
            Approve
          </button>
        </div>
      </td>
    </tr>
  );
};

export default PendingRow;