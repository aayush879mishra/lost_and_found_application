import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("reports");
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 🔔 Toast auto-hide
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  // 🔄 Sync user
  useEffect(() => {
    if (user) {
      setUsername(user.full_name || "");
      setEmail(user.email || "");
      if (user.profile_image) {
        setProfileImage(`http://localhost:5000${user.profile_image}`);
      }
    }
  }, [user]);

  // ✅ Fetch user
  const fetchUser = useCallback(async () => {
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch {
      handleLogout();
    } finally {
      setLoading(false);
    }
  }, [token, setUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // 📦 Fetch activity
  const fetchMyItems = useCallback(async () => {
    if (!user) return;

    try {
      const res = await axios.get(
        "http://localhost:5000/api/items/my-activity",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyItems(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  }, [user, token]);

  useEffect(() => {
    if (user) fetchMyItems();
  }, [user, fetchMyItems]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Delete this report permanently?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/items/delete/${type}/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMyItems((prev) =>
        prev.filter((i) => !(i.id === id && i.type === type))
      );

      setMessage("success: Deleted");
    } catch {
      setMessage("error: Failed");
    }
  };

  const handleResolve = async (type, id) => {
    if (!window.confirm("Mark as resolved?")) return;

    try {
      await axios.post(
        "http://localhost:5000/api/items/resolve",
        { type, id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMyItems((prev) =>
        prev.map((i) =>
          i.id === id && i.type === type
            ? { ...i, status: "resolved" }
            : i
        )
      );

      setMessage("success: Resolved");
    } catch {
      setMessage("error: Failed");
    }
  };

  const handleProfileSave = async () => {
    try {
      const formData = new FormData();
      formData.append("full_name", username);
      formData.append("email", email);
      if (selectedFile) formData.append("profileImage", selectedFile);

      await axios.put(
        "http://localhost:5000/api/auth/update-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setEditMode(false);
      setMessage("success: Updated");
      fetchUser();
    } catch {
      setMessage("error: Failed");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return setMessage("error: Password mismatch");
    }

    try {
      await axios.put(
        "http://localhost:5000/api/auth/change-password",
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("success: Password updated");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setMessage("error: Failed");
    }
  };

  if (loading)
    return <div className="p-20 text-center">Loading...</div>;

  return (
  <div className="min-h-screen bg-[#F8EDEB]">
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-600 hover:text-black"
        >
          ← Back to Home
        </button>

        <button
          onClick={handleLogout}
          className="border border-[#FF6B6B] text-[#FF6B6B] bg-transparent px-5 py-2 rounded-full text-sm font-semibold cursor-pointer hover:bg-[#FF6B6B] hover:text-white transition"
        >
          Logout
        </button>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="md:col-span-1 space-y-6">

          {/* PROFILE CARD */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
            <div className="relative w-28 h-28 mx-auto mb-4 group">
  {profileImage ? (
    <img
      src={profileImage}
      className="w-28 h-28 rounded-xl object-cover"
    />
  ) : (
    <div className="w-28 h-28 rounded-xl bg-gray-300 flex items-center justify-center text-2xl text-white">
      {username?.[0]}
    </div>
  )}

  {/* 🔥 Overlay (visible hint) */}
  {editMode && (
    <>
      <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
        <span className="text-white text-sm font-medium">
          Change Photo
        </span>
      </div>

      <input
        type="file"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={handleImageUpload}
      />
    </>
  )}
</div>

            {editMode ? (
              <div className="space-y-3 text-left">
                <input
                  className="w-full p-2 border rounded-md"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  className="w-full p-2 border rounded-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleProfileSave}
                    className="flex-1 bg-black text-white py-2 rounded-md"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex-1 border py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold">{username}</h2>
                <p className="text-sm text-gray-500">{email}</p>

                <button
                  onClick={() => setEditMode(true)}
                  className="mt-4 w-full border py-2 rounded-md hover:bg-gray-100"
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>

          {/* SECURITY CARD */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="font-semibold mb-4">Security</h3>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <input
                type="password"
                placeholder="New Password"
                className="w-full p-2 border rounded-md"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full p-2 border rounded-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button className="w-full bg-black text-white py-2 rounded-md">
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:col-span-2">

          {/* ACTIVITY CARD */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Your Activity</h3>
              <span className="text-sm text-gray-600">
                {myItems.length} items
              </span>
            </div>

            {myItems.length > 0 ? (
              <div className="space-y-4">
                {myItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border rounded-xl p-4 hover:bg-gray-50 transition"
                  >
                    <div>
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-sm text-gray-500 pb-2">
                        {item.location}
                      </p>
                      <span
  className={`text-xs font-medium capitalize px-2 py-1 rounded-full
    ${
      item.status === "active"
        ? "bg-green-100 text-green-700"
        : item.status === "resolved"
        ? "bg-blue-100 text-blue-700"
        : "bg-gray-100 text-gray-500"
    }`}
>
  {item.status}
</span>
                    </div>

                    <div className="flex gap-2">
                      {item.status !== "resolved" && (
                        <button
                          onClick={() =>
                            handleResolve(item.type, item.id)
                          }
                          className="text-sm border px-3 py-1 rounded-md hover:bg-gray-200"
                        >
                          Resolve
                        </button>
                      )}

                      <button
                        onClick={() =>
                          handleDelete(item.type, item.id)
                        }
                        className="text-sm border px-3 py-1 rounded-md text-red-500 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                No activity yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOAST */}
      {message && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-lg shadow-lg">
          {message.split(":")[1]}
        </div>
      )}
    </div>
  </div>
);
}

export default Profile;