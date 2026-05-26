import React from "react";

const ReportedItemRow = ({ report, onDeletePost, onDismissReport }) => (
  <tr className="border-t border-slate-100 hover:bg-slate-50 transition">
    <td className="px-6 py-4">
      <div>
        <p className="font-bold text-slate-800">{report.item_name || "Unknown Item"}</p>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          {report.item_type}
        </span>
      </div>
    </td>
    <td className="px-6 py-4">
      <p className="text-sm text-slate-700 font-medium">
        {report.reporter_name}
      </p>
      <p className="text-[10px] text-slate-400">
        {report.reported_at ? new Date(report.reported_at).toLocaleDateString() : ""}
      </p>
    </td>
    <td className="px-6 py-4">
      <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-xl border border-rose-100">
        ⚠️ {report.reason}
      </span>
    </td>
    <td className="px-6 py-4 text-right space-x-2">
      <button
        onClick={() => onDismissReport(report.report_id)}
        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition"
        title="Dismiss flag / Keep post"
      >
        Dismiss
      </button>
      <button
        onClick={() => onDeletePost(report.item_type, report.original_id || report.item_id, report.report_id)}
        className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition shadow-sm"
        title="Delete fraudulent post"
      >
        Delete Post
      </button>
    </td>
  </tr>
);

export default ReportedItemRow;