import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, lost: 0, found: 0, totalUsers: 0 });

  const [currentView, setCurrentView] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    if (!token) return;

    setLoading(true);

    try {
      const statsRes = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats({
        total: statsRes.data.activeItems + statsRes.data.resolvedItems,
        lost: statsRes.data.activeItems,
        found: statsRes.data.resolvedItems,
        totalUsers: statsRes.data.users
      });

      const usersRes = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(usersRes.data);

      const itemsRes = await axios.get("http://localhost:5000/api/items/feed?admin=true", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setItems(itemsRes.data);

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

  const handleResolveItem = async (type, id, currentStatus) => {
    if (currentStatus === "resolved") return;

    if (window.confirm("Mark this item as resolved?")) {
      try {
        await axios.post(
          "http://localhost:5000/api/admin/items/resolve",
          { type, id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setItems(prev =>
          prev.map(item =>
            item.id === id && item.type === type
              ? { ...item, status: "resolved" }
              : item
          )
        );

        fetchData();
      } catch {
        alert("Failed to resolve item");
      }
    }
  };

  const handleDeleteItem = async (type, id) => {
    if (window.confirm("Delete this report permanently?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/items/${type}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setItems(prev => prev.filter(item => !(item.id === id && item.type === type)));
        fetchData();
      } catch {
        alert("Failed to delete item");
      }
    }
  };

  const toggleBlock = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus ? 0 : 1;

      await axios.put(
        `http://localhost:5000/api/admin/users/block/${userId}`,
        { is_blocked: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(prev =>
        prev.map(u => (u.user_id === userId ? { ...u, is_blocked: newStatus } : u))
      );

    } catch {
      alert("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Delete this user and all reports?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUsers(prev => prev.filter(u => u.user_id !== userId));
        fetchData();

      } catch {
        alert("Could not delete user");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex text-slate-800">

      {/* Sidebar */}

      <aside className="w-72 bg-slate-950 text-white p-8 hidden lg:flex flex-col border-r border-slate-800">

        <div className="mb-12">
          {/* <h2 className="text-3xl font-black tracking-tight">
            LOST<span className="text-emerald-500">LINK</span>
          </h2> */}
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">
            Admin Panel
          </p>
        </div>

        <nav className="space-y-3">

          <NavItem icon="📊" label="Dashboard" active={currentView === "dashboard"} onClick={() => setCurrentView("dashboard")} />

          <NavItem icon="📦" label="Reports" active={currentView === "reports"} onClick={() => setCurrentView("reports")} />

          <NavItem icon="👥" label="Users" active={currentView === "users"} onClick={() => setCurrentView("users")} />

        </nav>

        <button
          onClick={() => navigate("/")}
          className="mt-auto py-3 bg-slate-800 rounded-xl text-sm font-semibold hover:bg-slate-700 transition"
        >
          Exit Dashboard
        </button>

      </aside>

      {/* Main */}

      <main className="flex-1 p-10">

        <header className="mb-10">
          <h1 className="text-3xl font-bold">
            {currentView === "dashboard"
              ? "Dashboard"
              : currentView === "users"
              ? "User Management"
              : "Reports"}
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            System monitoring and moderation
          </p>
        </header>

        {/* Stats */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

          <StatCard title="Total Items" value={stats.total} color="bg-blue-500" />
          <StatCard title="Active Reports" value={stats.lost} color="bg-rose-500" />
          <StatCard title="Resolved" value={stats.found} color="bg-emerald-500" />
          <StatCard title="Total Users" value={stats.totalUsers} color="bg-purple-500" />

        </div>

        {/* Table */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold">
              {currentView === "users" ? "User Database" : "Reports"}
            </h3>
          </div>

          <div className="overflow-x-auto">

            {currentView === "users" ? (

              <table className="w-full">

                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">

                  <tr>
                    <th className="px-6 py-4 text-left">User</th>
                    <th className="px-6 py-4 text-left">Role</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {users.map(u => (
                    <UserRow
                      key={u.user_id}
                      user={u}
                      onBlock={toggleBlock}
                      onDeleteUser={handleDeleteUser}
                    />
                  ))}

                </tbody>

              </table>

            ) : (

              <table className="w-full">

                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">

                  <tr>
                    <th className="px-6 py-4 text-left">Item</th>
                    <th className="px-6 py-4 text-left">Type</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>

                </thead>

                <tbody>

                  {items.map(item => (
                    <ReportRow
                      key={`${item.type}-${item.id}`}
                      item={item}
                      onDelete={handleDeleteItem}
                      onResolve={handleResolveItem}
                    />
                  ))}

                </tbody>

              </table>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition
    ${
      active
        ? "bg-emerald-500 text-white shadow-lg"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`}
  >
    <span>{icon}</span>
    {label}
  </button>
);

const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">

    <div className="flex justify-between items-center mb-3">
      <p className="text-xs text-slate-400 uppercase tracking-wider">{title}</p>
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
    </div>

    <h2 className="text-3xl font-bold">{value}</h2>

  </div>
);

const UserRow = ({ user, onBlock, onDeleteUser }) => (

  <tr className="border-t border-slate-100 hover:bg-slate-50">

    <td className="px-6 py-4">

      <div className="font-semibold">{user.full_name}</div>
      <div className="text-sm text-slate-400">{user.email}</div>

    </td>

    <td className="px-6 py-4 text-sm">{user.role}</td>

    <td className="px-6 py-4">

      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full ${
          user.is_blocked
            ? "bg-rose-100 text-rose-600"
            : "bg-emerald-100 text-emerald-600"
        }`}
      >
        {user.is_blocked ? "Blocked" : "Active"}
      </span>

    </td>

    <td className="px-6 py-4 text-right space-x-2">

      {user.role !== "admin" && (
        <>
          <button
            onClick={() => onBlock(user.user_id, user.is_blocked)}
            className="text-xs px-3 py-1 border rounded-md hover:bg-slate-100"
          >
            {user.is_blocked ? "Unblock" : "Block"}
          </button>

          <button
            onClick={() => onDeleteUser(user.user_id)}
            className="text-rose-500 hover:text-rose-700"
          >
            🗑️
          </button>
        </>
      )}

    </td>

  </tr>

);

const ReportRow = ({ item, onDelete, onResolve }) => (

  <tr className="border-t border-slate-100 hover:bg-slate-50">

    <td className="px-6 py-4 flex items-center gap-4">

      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">

        <img
          src={item.image ? `http://localhost:5000${item.image}` : "https://placehold.co/100"}
          className="w-full h-full object-cover"
          alt=""
        />

      </div>

      <div>
        <p className="font-semibold">{item.item_name}</p>
        <p className="text-sm text-slate-400">{item.location}</p>
      </div>

    </td>

    <td className="px-6 py-4 text-sm capitalize">{item.type}</td>

    <td className="px-6 py-4">

      <span
        className={`text-xs font-semibold ${
          item.status === "resolved" ? "text-blue-500" : "text-orange-500"
        }`}
      >
        {item.status}
      </span>

      {item.status !== "resolved" && (
        <button
          onClick={() => onResolve(item.type, item.id, item.status)}
          className="block text-xs text-emerald-600 mt-1 hover:underline"
        >
          Mark Resolved
        </button>
      )}

    </td>

    <td className="px-6 py-4 text-right">

      <button
        onClick={() => onDelete(item.type, item.id)}
        className="text-rose-500 hover:text-rose-700"
      >
        🗑️
      </button>

    </td>

  </tr>

);

export default AdminDashboard;