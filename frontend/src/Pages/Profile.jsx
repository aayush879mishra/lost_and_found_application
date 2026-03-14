import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Local form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("reports");
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Password Change States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Auto-hide toast messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  /* 1️⃣ SYNC LOCAL STATE WITH USER PROP */
  useEffect(() => {
    if (user) {
      setUsername(user.full_name || "");
      setEmail(user.email || "");
      if (user.profile_image) {
        // Use the full URL for the image
        setProfileImage(`http://localhost:5000${user.profile_image}`);
      }
    }
  }, [user]);

  /* 2️⃣ REFRESH USER DATA */
  const fetchUser = useCallback(async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return;

    try {
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("TOKEN ERROR:", err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  
  /* 3️⃣ FETCH ACTIVITY LOG (Updated for Dedicated Endpoint) */
const fetchMyItems = useCallback(async () => {
  if (!user) return; // Wait until user object is available
  
  try {
    // We now call the specific 'my-activity' route instead of the global feed
    const res = await axios.get("http://localhost:5000/api/items/my-activity", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Activity Data Received:", res.data); 
    setMyItems(res.data);
  } catch (err) {
    console.error("Failed to fetch user activity:", err);
    // If the token is expired or invalid, we don't want an infinite loading state
    if (err.response?.status === 401) {
      handleLogout();
    }
  }
}, [token, user]); // Removed unnecessary 'filtered' logic

// Ensure activity is fetched when user is verified
useEffect(() => {
  if (user) fetchMyItems();
}, [user, fetchMyItems]);
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  /* 7️⃣ DELETE POST LOGIC */
  const handleDelete = async (type, id) => {
    if (
      !window.confirm(
        "Are you sure? This will permanently remove the report from LostLink.",
      )
    )
      return;

    try {
      await axios.delete(
        `http://localhost:5000/api/items/delete/${type}/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Remove from local state immediately
      setMyItems((prev) =>
        prev.filter((item) => !(item.id === id && item.type === type)),
      );
      setMessage("success: Post deleted permanently");
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("error: Failed to delete the post");
    }
  };

  /* 4️⃣ CHANGE PASSWORD LOGIC */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("error: Passwords do not match");
      return;
    }

    try {
      await axios.put(
        "http://localhost:5000/api/auth/change-password",
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessage("success: Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage("error: Failed to update password");
    }
  };

  /* 5️⃣ PROFILE IMAGE UPDATE */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setProfileImage(URL.createObjectURL(file)); // Local preview
  };

  /* 6️⃣ SAVE PROFILE CHANGES (Name, Email, Image) */
  const handleProfileSave = async () => {
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("full_name", username);
      formData.append("email", email);
      if (selectedFile) formData.append("profileImage", selectedFile);

      const res = await axios.put(
        "http://localhost:5000/api/auth/update-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setMessage("success: Profile updated successfully");
      setEditMode(false);
      // Fetch fresh data to ensure profile_image URL is correct from server
      fetchUser();
    } catch (err) {
      setMessage("error: Failed to update profile");
    }
  };

  const handleResolve = async (type, id) => {
    if (
      !window.confirm(
        "Mark this item as resolved? It will be hidden from the public feed.",
      )
    )
      return;

    try {
      await axios.post(
        "http://localhost:5000/api/items/resolve",
        { type, id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update local state immediately for better UX
      setMyItems((prev) =>
        prev.map((item) =>
          item.id === id && item.type === type
            ? { ...item, status: "resolved" }
            : item,
        ),
      );

      setMessage("success: Great! Item marked as resolved");
    } catch {
      setMessage("error: Failed to resolve item");
    }
  };

  const resolvedCount = myItems.filter((i) => i.status === "resolved").length;

  if (loading && !user)
    return (
      <div className="p-20 text-center font-bold">Verifying Session...</div>
    );

  return (
    <div className="min-h-screen bg-[#F8EDEB] pb-10 font-sans">
      <div className="max-w-4xl mx-auto pt-10 px-4">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-800 transition"
          >
            ← Back to Feed
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-50 text-red-500 px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            Logout
          </button>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 flex flex-col md:flex-row gap-10 items-center border border-white">
          <div className="text-center">
            <div className="relative inline-block group">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="profile"
                  className="w-40 h-40 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl"
                />
              ) : (
                <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-tr from-[#FF6B6B] to-[#ff8e8e] text-white flex items-center justify-center text-6xl font-black shadow-xl">
                  {username?.[0]?.toUpperCase()}
                </div>
              )}
              {editMode && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2.5rem] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-black text-[10px] uppercase">
                    Change Photo
                  </span>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedFile(file);
                        setProfileImage(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              )}
            </div>
            <h2 className="text-3xl font-black text-gray-800 mt-5 leading-tight">
              {username}
            </h2>
            <div className="flex gap-2 justify-center mt-1">
              <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                {user?.role || "Member"}
              </span>
              {resolvedCount > 0 && (
                <span className="text-green-500 font-black uppercase text-[10px] tracking-widest bg-green-50 px-3 py-1 rounded-lg border border-green-100">
                  ✨ {resolvedCount} Resolved
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 w-full">
            {editMode ? (
              <div className="space-y-3">
                <div className="group">
                  <p className="text-[10px] font-black text-gray-400 uppercase ml-4 mb-1 tracking-widest">
                    Full Name
                  </p>
                  <input
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 border border-transparent focus:border-[#FF6B6B]/20 transition-all"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="group">
                  <p className="text-[10px] font-black text-gray-400 uppercase ml-4 mb-1 tracking-widest">
                    Email Address
                  </p>
                  <input
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 border border-transparent focus:border-[#FF6B6B]/20 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleProfileSave}
                    className="flex-1 bg-[#FF6B6B] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-red-100"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black uppercase text-xs tracking-widest"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Authenticated Email
                  </p>
                  <p className="text-gray-700 font-black text-lg">{email}</p>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200 hover:-translate-y-1 transition-all"
                >
                  Edit Profile Settings
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="mt-10 bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-white">
          <div className="flex bg-gray-50/50 p-3">
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === "reports" ? "bg-white text-[#FF6B6B] shadow-sm" : "text-gray-400"}`}
            >
              Activity Log
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === "settings" ? "bg-white text-[#FF6B6B] shadow-sm" : "text-gray-400"}`}
            >
              Security
            </button>
          </div>

          <div className="p-8">
            {activeTab === "reports" ? (
              myItems.length > 0 ? (
                <div className="grid gap-4">
                  {myItems.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="group flex flex-col md:flex-row items-center justify-between p-5 rounded-[2rem] border border-gray-50 hover:border-[#FF6B6B]/20 hover:bg-gray-50/50 transition-all gap-4"
                    >
                      <div className="flex items-center gap-5 w-full md:w-auto">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${item.type === "lost" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}
                        >
                          {item.type === "lost" ? "🔍" : "📦"}
                        </div>
                        <div>
                          <h4 className="font-black text-gray-800 text-lg leading-tight">
                            {item.item_name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                              📍 {item.location}
                            </span>
                            <span
                              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${item.type === "lost" ? "text-red-400 bg-red-50" : "text-green-400 bg-green-50"}`}
                            >
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        {/* RESOLVE BUTTON */}
                        {item.status !== "resolved" ? (
                          <button
                            onClick={() => handleResolve(item.type, item.id)}
                            className="bg-white border border-gray-200 text-gray-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-green-400 hover:text-green-500 hover:bg-green-50 transition-all"
                          >
                            Resolve
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-green-500 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              Recovered
                            </span>
                          </div>
                        )}

                        {/* DELETE BUTTON */}
                        <button
                          onClick={() => handleDelete(item.type, item.id)}
                          className="p-2 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl border border-transparent hover:border-red-100 transition-all shadow-sm"
                          title="Delete Post"
                        >
                          <svg
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                  <p className="text-4xl mb-4">📭</p>
                  <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
                    You haven't reported anything yet
                  </p>
                </div>
              )
            ) : (
              <form
                onSubmit={handleChangePassword}
                className="max-w-md mx-auto space-y-4 py-4"
              >
                <div className="text-center mb-8">
                  <h3 className="font-black text-2xl text-gray-800">
                    Update Credentials
                  </h3>
                  <p className="text-gray-400 text-xs font-bold">
                    Keep your account secure with a strong password.
                  </p>
                </div>
                <input
                  type="password"
                  className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold border border-transparent focus:border-slate-200 transition-all"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold border border-transparent focus:border-slate-200 transition-all"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all"
                >
                  Update Security Key
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        {message && (
          <div
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-50 flex items-center gap-3 animate-slide-up ${message.includes("success") ? "bg-green-500" : "bg-red-500"} text-white`}
          >
            <span>{message.includes("success") ? "✅" : "⚠️"}</span>
            <span className="uppercase text-xs tracking-widest">
              {message.split(":")[1]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
