import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; // NEW: Toast import
import { 
  ArrowLeft, 
  LogOut, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Trash2, 
  Camera,
  Mail,
  AlertCircle, // NEW: Icon for rejected
  Clock
} from "lucide-react";

function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Sync user data
  useEffect(() => {
    if (user) {
      setUsername(user.full_name || "");
      setEmail(user.email || "");
      if (user.profile_image) {
        setProfileImage(`http://localhost:5000${user.profile_image}`);
      }
    }
  }, [user]);

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

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const fetchMyItems = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get("http://localhost:5000/api/items/my-activity", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyItems(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  }, [user, token]);

  useEffect(() => { if (user) fetchMyItems(); }, [user, fetchMyItems]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
    toast.success("Signed out successfully");
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Delete this report permanently?")) return;
    const loadingToast = toast.loading("Deleting...");
    try {
      await axios.delete(`http://localhost:5000/api/items/delete/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
      toast.success("Report deleted", { id: loadingToast });
    } catch { 
      toast.error("Failed to delete", { id: loadingToast }); 
    }
  };

  const handleResolve = async (type, id) => {
    if (!window.confirm("Mark as resolved?")) return;
    try {
      await axios.post("http://localhost:5000/api/items/resolve", { type, id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyItems((prev) => prev.map((i) => i.id === id && i.type === type ? { ...i, status: "resolved" } : i));
      toast.success("Marked as resolved!");
    } catch { 
      toast.error("Action failed"); 
    }
  };

  const handleProfileSave = async () => {
    const loadingToast = toast.loading("Updating profile...");
    try {
      const formData = new FormData();
      formData.append("full_name", username);
      formData.append("email", email);
      if (selectedFile) formData.append("profileImage", selectedFile);

      await axios.put("http://localhost:5000/api/auth/update-profile", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });

      setEditMode(false);
      toast.success("Profile updated!", { id: loadingToast });
      fetchUser();
    } catch { 
      toast.error("Update failed", { id: loadingToast }); 
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
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    
    try {
      await axios.put("http://localhost:5000/api/auth/change-password", { password: newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch { 
      toast.error("Failed to change password"); 
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-sans">
      {/* Toast Container */}
      <Toaster position="bottom-center" reverseOrder={false} />

      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2 text-sm font-black text-[#6B7280] hover:text-[#111827] uppercase tracking-widest transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back 
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[#E11D48] font-black text-xs uppercase tracking-widest hover:opacity-70 transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT: PROFILE & SECURITY */}
          <div className="lg:col-span-1 space-y-8">
            {/* PROFILE CARD */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-8">
              <div className="relative w-32 h-32 mx-auto mb-6 group">
                <div className="w-full h-full rounded-3xl overflow-hidden bg-[#F3F4F6] border-4 border-white shadow-sm">
                  {profileImage ? (
                    <img src={profileImage} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-[#9CA3AF]">
                      {username?.[0]}
                    </div>
                  )}
                </div>

                {editMode && (
                  <label className="absolute inset-0 bg-black/40 rounded-3xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <Camera className="text-white w-6 h-6 mb-1" />
                    <span className="text-white text-[10px] font-black uppercase">Change</span>
                    <input type="file" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      className="w-full px-4 py-3 bg-[#F9FAFB] border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#4F46E5] transition"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      className="w-full px-4 py-3 bg-[#F9FAFB] border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#4F46E5] transition"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleProfileSave} className="flex-1 bg-[#4F46E5] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#4F46E5]/20 hover:opacity-90 transition">Save</button>
                    <button onClick={() => setEditMode(false)} className="flex-1 bg-[#F3F4F6] text-[#6B7280] py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="text-xl font-black text-[#111827] mb-1">{username}</h2>
                  <p className="text-sm font-bold text-[#9CA3AF] flex items-center justify-center gap-2 mb-6">
                    <Mail className="w-3.5 h-3.5" /> {email}
                  </p>
                  <button onClick={() => setEditMode(true)} className="w-full py-3 rounded-xl border-2 border-[#F3F4F6] text-xs font-black text-[#111827] uppercase tracking-widest hover:bg-[#F3F4F6] transition">
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

            {/* SECURITY CARD */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-8">
              <div className="flex items-center gap-2 mb-6 text-[#111827]">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-black text-sm uppercase tracking-widest">Security</h3>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full px-4 py-3 bg-[#F9FAFB] border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#4F46E5] transition"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 bg-[#F9FAFB] border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#4F46E5] transition"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button className="w-full bg-[#111827] text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition">
                  Update Password
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: ACTIVITY */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] p-10 h-full">
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-[#4F46E5]" />
                  <h3 className="font-black text-2xl text-[#111827]">Your Activity</h3>
                </div>
                <span className="bg-[#EEF2FF] text-[#4F46E5] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                  {myItems.length} Reports
                </span>
              </div>

              {myItems.length > 0 ? (
                <div className="space-y-6">
                  {myItems.map((item) => (
                    <div key={`${item.type}-${item.id}`} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-3xl border border-gray-50 hover:border-[#4F46E5]/20 hover:shadow-md transition-all group relative overflow-hidden">
                      
                      {/* Left: Content */}
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-black text-lg text-[#111827] leading-none">{item.item_name}</p>
                          
                          {/* Status Badges */}
                          {item.is_approved === 'rejected' ? (
                            <span className="flex items-center gap-1 bg-[#FFF1F2] text-[#E11D48] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                              <AlertCircle className="w-2.5 h-2.5" /> Rejected
                            </span>
                          ) : item.is_approved === 'pending' ? (
                            <span className="flex items-center gap-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                              <Clock className="w-2.5 h-2.5" /> Pending Approval
                            </span>
                          ) : (
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${item.status === 'resolved' ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-emerald-50 text-emerald-600'}`}>
                              {item.status === 'resolved' ? 'Resolved' : 'Live'}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm font-bold text-[#9CA3AF] mb-1">{item.location}</p>
                        
                        {/* Reject Reason (if any) */}
                        {item.is_approved === 'rejected' && item.admin_feedback && (
                          <p className="text-[11px] font-bold text-[#E11D48] italic bg-rose-50 px-3 py-1 rounded-lg mt-2 inline-block">
                             Reason: {item.admin_feedback}
                          </p>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex gap-3 w-full sm:w-auto">
                        {item.is_approved === 'approved' && item.status !== "resolved" && (
                          <button
                            onClick={() => handleResolve(item.type, item.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-[#F3F4F6] rounded-xl text-xs font-black text-[#111827] uppercase tracking-widest hover:bg-[#F3F4F6] transition"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Resolve
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.type, item.id)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FFF1F2] text-[#E11D48] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#FFE4E6] transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 bg-[#F9FAFB] rounded-3xl flex items-center justify-center mb-4 text-[#D1D5DB]">
                    <Activity className="w-8 h-8" />
                  </div>
                  <h4 className="text-[#111827] font-black text-lg">No activity found</h4>
                  <p className="text-[#9CA3AF] font-bold text-sm max-w-[200px] mt-1">You haven't reported any lost or found items yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;