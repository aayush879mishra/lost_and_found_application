import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Clean modular sub-component imports
import NavItem from "../Components/Admin/NavItem";
import StatCard from "../Components/Admin/StatCard";
import PendingRow from "../Components/Admin/PendingRow";
import UserRow from "../Components/Admin/UserRow";
import ReportRow from "../Components/Admin/ReportRow";
import ReportedItemRow from "../Components/Admin/ReportedItemRow"; // Integrated new row layout

function AdminDashboard({ user, setUser }) {
  const [items, setItems] = useState([]);
  const [resolvedItems, setResolvedItems] = useState([]); 
  const [pendingItems, setPendingItems] = useState([]);
  const [reportedFlags, setReportedFlags] = useState([]); // Enabled spam/fraud flag state
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

      // 3. Fetch Live Reports (Approved / Active)
      const itemsRes = await axios.get("http://localhost:5000/api/items/feed?admin=true", config);
      setItems(itemsRes.data);

      // 4. Fetch Pending Approvals
      const pendingRes = await axios.get("http://localhost:5000/api/admin/pending", config);
      setPendingItems(pendingRes.data);

      // 5. Fetch Resolved Items
      const resolvedRes = await axios.get("http://localhost:5000/api/admin/resolved", config);
      const mappedResolved = resolvedRes.data.map(item => ({
        ...item,
        type: item.lost_id ? 'lost' : 'found',
        id: item.lost_id || item.found_id
      }));
      setResolvedItems(mappedResolved);

      // 6. Fetch User Spam/Fraud Flags (Using the updated router endpoint path)
      const reportsRes = await axios.get("http://localhost:5000/api/admin/reports", config);
      setReportedFlags(reportsRes.data);

    } catch (err) {
      console.error("Dashboard data fetching failed:", err);
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

  // Dismiss user complaint flag without deleting the live website post
  const handleDismissReport = async (reportId) => {
    if (window.confirm("Dismiss this report flag? The post will remain live on LostLink.")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/reports/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (err) {
        alert("Failed to dismiss report flag.");
      }
    }
  };

  // Delete both the actual fraudulent post and clear the dashboard complaint log entry
  const handleDeleteReportedPost = async (type, id, reportId) => {
    if (window.confirm("Are you certain this post is spam or fraud? This action removes the post permanently.")) {
      try {
        // 1. Remove the post row from lost_items or found_items
        await axios.delete(`http://localhost:5000/api/admin/items/${type}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // 2. Clear out the corresponding flag logger entry reference
        await axios.delete(`http://localhost:5000/api/admin/reports/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
        alert("Fraudulent post removed successfully.");
      } catch (err) {
        alert("Failed to complete full post removal operation.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (setUser) setUser(null);
    navigate("/login");
  };

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

  const activeReports = items.filter(item => item.status !== "resolved");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-900 text-white p-8 hidden lg:flex flex-col shadow-xl">
        <div className="mb-12">
          <h2 className="text-2xl font-black tracking-tighter text-emerald-400">LOSTLINK</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Admin Panel</p>
        </div>

        <nav className="space-y-2">
          <NavItem icon="📊" label="Dashboard" active={currentView === "dashboard"} onClick={() => setCurrentView("dashboard")} />
          <NavItem icon="⌛" label={`Pending (${pendingItems.length})`} active={currentView === "pending"} onClick={() => setCurrentView("pending")} />
          <NavItem icon="📦" label={`Live Reports (${activeReports.length})`} active={currentView === "reports"} onClick={() => setCurrentView("reports")} />
          <NavItem icon="🚩" label={`User Flags (${reportedFlags.length})`} active={currentView === "flags"} onClick={() => setCurrentView("flags")} />
          <NavItem icon="✅" label={`Resolved Items (${resolvedItems.length})`} active={currentView === "resolved"} onClick={() => setCurrentView("resolved")} />
          <NavItem icon="👥" label="Users" active={currentView === "users"} onClick={() => setCurrentView("users")} />
        </nav>

        <button onClick={handleLogout} className="mt-auto py-3 bg-slate-800 rounded-xl text-sm font-bold hover:bg-rose-500 transition-colors duration-300">
          Logout
        </button>
      </aside>

      {/* Main Panel View Workspace */}
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
            
            {/* SPAM & FRAUD USER FLAGS VIEW TAB */}
            {currentView === "flags" && (
                <table className="w-full">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4 text-left">Reported Item</th>
                      <th className="px-6 py-4 text-left">Reported By</th>
                      <th className="px-6 py-4 text-left">Reason Given</th>
                      <th className="px-6 py-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportedFlags.map(report => (
                      <ReportedItemRow 
                        key={report.report_id} 
                        report={report} 
                        onDismissReport={handleDismissReport} 
                        onDeletePost={handleDeleteReportedPost} 
                      />
                    ))}
                    {reportedFlags.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-20 text-center text-slate-400 italic">
                          No reports flagged by users. Your platform is safe and clean!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
            )}

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
                    {activeReports.map(item => (
                      <ReportRow key={`${item.type || (item.lost_id ? 'lost' : 'found')}-${item.id || item.lost_id || item.found_id}`} item={item} onDelete={handleDeleteItem} onResolve={handleResolveItem} />
                    ))}
                    {activeReports.length === 0 && (
                      <tr><td colSpan="4" className="p-20 text-center text-slate-400 italic">No active reports found.</td></tr>
                    )}
                  </tbody>
                </table>
            )}

            {currentView === "resolved" && (
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
                    {resolvedItems.map(item => (
                      <ReportRow key={`${item.type}-${item.id}`} item={item} onDelete={handleDeleteItem} onResolve={handleResolveItem} />
                    ))}
                    {resolvedItems.length === 0 && (
                      <tr><td colSpan="4" className="p-20 text-center text-slate-400 italic">No resolved reports yet.</td></tr>
                    )}
                  </tbody>
                </table>
            )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;