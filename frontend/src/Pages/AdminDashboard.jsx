import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0, totalUsers: 0 });

  const [currentView, setCurrentView] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 1. Fetch Stats
      const statsRes = await axios.get("http://localhost:5000/api/admin/stats", config);
      setStats({
        total: statsRes.data.activeItems + statsRes.data.resolvedItems,
        active: statsRes.data.activeItems,
        resolved: statsRes.data.resolvedItems,
        totalUsers: statsRes.data.users
      });

      // 2. Fetch Users
      const usersRes = await axios.get("http://localhost:5000/api/admin/users", config);
      setUsers(usersRes.data);

      // 3. Fetch Live Reports (Approved)
      const itemsRes = await axios.get("http://localhost:5000/api/items/feed?admin=true", config);
      setItems(itemsRes.data);

      // 4. Fetch Pending Approvals
      const pendingRes = await axios.get("http://localhost:5000/api/admin/pending", config);
      setPendingItems(pendingRes.data);

    } catch (err) {
      console.error(err);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) navigate("/login");
    else fetchData();
  }, [token, fetchData, navigate]);

  // --- HANDLERS ---

  const handleApprovalAction = async (id, type, decision) => {
    const feedback = decision === 'rejected' ? window.prompt("Reason for rejection:") : null;
    if (decision === 'rejected' && feedback === null) return;

    try {
      await axios.post(
        "http://localhost:5000/api/admin/approve-deny",
        { id, type, decision, feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPendingItems(prev => prev.filter(item => !(item.lost_id === id || item.found_id === id)));
      fetchData(); 
      alert(`Item ${decision} successfully!`);
    } catch (err) {
      alert("Action failed: " + err.message);
    }
  };

  const handleResolveItem = async (type, id, currentStatus) => {
    if (currentStatus === "resolved") return;
    if (window.confirm("Mark this item as resolved?")) {
      try {
        await axios.post("http://localhost:5000/api/admin/items/resolve", { type, id }, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
      } catch { alert("Failed to resolve item"); }
    }
  };

  const handleDeleteItem = async (type, id) => {
    if (window.confirm("Delete this report permanently?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/items/${type}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
      } catch { alert("Failed to delete item"); }
    }
  };

  const toggleBlock = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus ? 0 : 1;
      await axios.put(`http://localhost:5000/api/admin/users/block/${userId}`, { is_blocked: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch { alert("Failed to update user status"); }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Delete this user and all reports?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
      } catch { alert("Could not delete user"); }
    }
  };

  // --- RENDER HELPERS ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white p-8 hidden lg:flex flex-col shadow-xl">
        <div className="mb-12">
          <h2 className="text-2xl font-black tracking-tighter text-emerald-400">LOSTLINK</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Admin Panel</p>
        </div>

        <nav className="space-y-2">
          <NavItem icon="📊" label="Dashboard" active={currentView === "dashboard"} onClick={() => setCurrentView("dashboard")} />
          <NavItem icon="⌛" label={`Pending (${pendingItems.length})`} active={currentView === "pending"} onClick={() => setCurrentView("pending")} />
          <NavItem icon="📦" label="Live Reports" active={currentView === "reports"} onClick={() => setCurrentView("reports")} />
          <NavItem icon="👥" label="Users" active={currentView === "users"} onClick={() => setCurrentView("users")} />
        </nav>

        <button onClick={() => navigate("/")} className="mt-auto py-3 bg-slate-800 rounded-xl text-sm font-bold hover:bg-rose-500 transition-colors duration-300">
          Logout
        </button>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black capitalize text-slate-900">{currentView.replace('-', ' ')}</h1>
          <p className="text-sm text-slate-500 mt-1">System Overview & Management</p>
        </header>

        {currentView === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <StatCard title="Total Volume" value={stats.total} color="bg-blue-500" />
            <StatCard title="Active Reports" value={stats.active} color="bg-rose-500" />
            <StatCard title="Resolved" value={stats.resolved} color="bg-emerald-500" />
            <StatCard title="Total Users" value={stats.totalUsers} color="bg-purple-500" />
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {currentView === "pending" && (
              <table className="w-full">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 text-left">Item Request</th>
                    <th className="px-6 py-4 text-left">User Info</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingItems.map(item => (
                    <PendingRow key={`${item.item_type}-${item.lost_id || item.found_id}`} item={item} onAction={handleApprovalAction} />
                  ))}
                  {pendingItems.length === 0 && (
                    <tr><td colSpan="3" className="p-20 text-center text-slate-400 italic">Zero pending approvals.</td></tr>
                  )}
                </tbody>
              </table>
            )}

            {currentView === "users" && (
                <table className="w-full">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4 text-left">User</th>
                      <th className="px-6 py-4 text-left">Role</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <UserRow key={user.user_id} user={user} onBlock={toggleBlock} onDeleteUser={handleDeleteUser} />
                    ))}
                  </tbody>
                </table>
            )}

            {currentView === "reports" && (
                <table className="w-full">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4 text-left">Item</th>
                      <th className="px-6 py-4 text-left">Type</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <ReportRow key={`${item.type}-${item.id}`} item={item} onDelete={handleDeleteItem} onResolve={handleResolveItem} />
                    ))}
                  </tbody>
                </table>
            )}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const PendingRow = ({ item, onAction }) => {
  const id = item.lost_id || item.found_id;
  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50 transition">
      <td className="px-6 py-4 flex items-center gap-4">
        <img src={item.image ? `http://localhost:5000${item.image}` : "https://placehold.co/100"} className="w-12 h-12 rounded-xl object-cover border" alt="" />
        <div>
          <p className="font-bold text-slate-800">{item.item_name}</p>
          <p className="text-xs text-slate-400 font-medium">{item.location}</p>
        </div>
      </td>
      <td className="px-6 py-4">
         <p className="text-sm font-semibold">{item.phone || "No Phone"}</p>
         <p className="text-[10px] text-slate-400">UID: {item.user_id}</p>
      </td>
      <td className="px-6 py-4 text-right space-x-2">
        <button onClick={() => onAction(id, item.item_type, 'approved')} className="bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-emerald-600 transition">Approve</button>
        <button onClick={() => onAction(id, item.item_type, 'rejected')} className="bg-rose-50 text-rose-500 border border-rose-100 text-xs px-4 py-2 rounded-lg font-bold hover:bg-rose-50 transition">Reject</button>
      </td>
    </tr>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
    <span className="text-lg">{icon}</span> {label}
  </button>
);

const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
    </div>
    <h2 className="text-3xl font-black text-slate-900">{value}</h2>
  </div>
);

const UserRow = ({ user, onBlock, onDeleteUser }) => (
  <tr className="border-t border-slate-100 hover:bg-slate-50 transition">
    <td className="px-6 py-4">
      <div className="font-bold text-slate-800">{user.full_name}</div>
      <div className="text-xs text-slate-400">{user.email}</div>
    </td>
    <td className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{user.role}</td>
    <td className="px-6 py-4">
      <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${user.is_blocked ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
        {user.is_blocked ? "Blocked" : "Active"}
      </span>
    </td>
    <td className="px-6 py-4 text-right space-x-3">
      {user.role !== "admin" && (
        <>
          <button onClick={() => onBlock(user.user_id, user.is_blocked)} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition">
            {user.is_blocked ? "Unblock" : "Block"}
          </button>
          <button onClick={() => onDeleteUser(user.user_id)} className="text-rose-500 hover:text-rose-700 transition">🗑️</button>
        </>
      )}
    </td>
  </tr>
);

const ReportRow = ({ item, onDelete, onResolve }) => (
  <tr className="border-t border-slate-100 hover:bg-slate-50 transition">
    <td className="px-6 py-4 flex items-center gap-4">
      <img src={item.image ? `http://localhost:5000${item.image}` : "https://placehold.co/100"} className="w-10 h-10 rounded-lg object-cover" alt="" />
      <div>
        <p className="font-bold text-slate-800">{item.item_name}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase">{item.location}</p>
      </div>
    </td>
    <td className="px-6 py-4 text-xs font-bold uppercase text-slate-500">{item.type}</td>
    <td className="px-6 py-4">
      <div className={`text-[10px] font-black uppercase ${item.status === "resolved" ? "text-emerald-500" : "text-orange-500"}`}>
        {item.status}
      </div>
      {item.status !== "resolved" && (
        <button onClick={() => onResolve(item.type, item.id, item.status)} className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 hover:underline transition">
          Resolve
        </button>
      )}
    </td>
    <td className="px-6 py-4 text-right">
      <button onClick={() => onDelete(item.type, item.id)} className="text-rose-500 hover:text-rose-700 transition">🗑️</button>
    </td>
  </tr>
);

export default AdminDashboard;