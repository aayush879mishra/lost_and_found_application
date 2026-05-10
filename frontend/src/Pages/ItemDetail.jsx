import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MapView from "../Components/MapView";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  MessageCircle, 
  Tag, 
  Palette, 
  CheckCircle2, 
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

function ItemDetail({ user }) {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/items/details/${type}/${id}`);
        setItem(res.data);
      } catch (err) {
        console.error("Error fetching item:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [type, id]);


  // NEW: Handle Reporting Logic
  const handleReport = async () => {
    if (!user) {
      toast.error("Please login to report posts.");
      return;
    }

    const reason = window.prompt("Why are you reporting this post? (Spam, Fake, Inappropriate, etc.)");
    
    if (!reason) return;
    if (reason.length < 5) {
      toast.error("Please provide a valid reason.");
      return;
    }

    const loadingToast = toast.loading("Submitting report...");
    
    try {
      await axios.post("http://localhost:5000/api/items/report", {
        item_id: id,
        item_type: type,
        reason: reason
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      toast.success("Post reported. Thank you for keeping LostLink safe!", { id: loadingToast }, {duration: 6000});
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to submit report";
      toast.error(errorMsg, { id: loadingToast });
    }
  };


  const handleContact = async () => {
    if (!user) {
      alert("Please login to contact the owner.");
      navigate("/login");
      return;
    }

    const cleanPhone = item.phone ? item.phone.replace(/\D/g, "") : "";
    if (!cleanPhone) {
      alert("This user has not provided a valid contact number.");
      return;
    }

    setSending(true);
    try {
      await axios.post("http://localhost:5000/api/items/notify-connection", {
        ownerEmail: item.email,
        ownerName: item.full_name,
        itemName: item.item_name,
        requesterName: user.full_name,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
    } catch (err) {
      console.error("Notification failed:", err);
    } finally {
      const message = `Hi ${item.full_name || "there"}, I saw your report on LostLink for the ${item.type} item: "${item.item_name}". I'd like to discuss this with you.`;
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      setTimeout(() => setSending(false), 1000);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-gray-100 border-t-[#4F46E5] rounded-full animate-spin"></div>
    </div>
  );

  if (!item) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <h2 className="text-4xl font-extrabold text-[#111827] mb-4">Item Not Found</h2>
      <button onClick={() => navigate("/")} className="text-[#4F46E5] font-bold hover:underline flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Return to Directory
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 font-sans">
      {/* HEADER NAVIGATION */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-bold text-[#6B7280] hover:text-[#111827] transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back to browse
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        {/* HEADER SECTION */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              item.type === 'lost' ? 'bg-[#FFF1F2] text-[#E11D48]' : 'bg-[#EEF2FF] text-[#4F46E5]'
            }`}>
              {item.type}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" /> Reported {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-5xl font-black text-[#111827] tracking-tight mb-4 leading-tight">
            {item.item_name}
          </h1>
          <p className="flex items-center gap-2 text-[#6B7280] font-semibold">
            <MapPin className="w-5 h-5 text-[#4F46E5]" /> {item.location}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT COLUMN: VISUALS & CONTENT */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* MAIN IMAGE */}
            <div className="rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] bg-white">
              <img 
                src={`http://localhost:5000${item.image}`} 
                alt={item.item_name} 
                className="w-full h-auto max-h-[600px] object-cover"
              />
            </div>

            {/* DESCRIPTION BOX */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-50 shadow-sm">
              <h3 className="text-2xl font-extrabold text-[#111827] mb-6">Description</h3>
              <p className="text-[#4B5563] text-lg leading-relaxed mb-10 whitespace-pre-line">
                {item.description || "No detailed description provided for this item."}
              </p>

              <div className="grid grid-cols-2 gap-8 border-t border-gray-50 pt-10">
                <div>
                  <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Tag className="w-3 h-3" /> Item Category
                  </p>
                  <p className="text-[#1F2937] font-bold text-lg">{item.category}</p>
                </div>
                {/* <div>
                  <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" /> Found Status
                  </p>
                  <p className="text-[#1F2937] font-bold text-lg">
                    {item.status === 'resolved' ? 'Recovered' : 'Not yet found'}
                  </p>
                </div> */}
              </div>
            </div>

            {/* MAP SECTION */}
            {item.latitude && item.longitude && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-50 shadow-sm">
                <h3 className="text-2xl font-extrabold text-[#111827] mb-6">Last Known Location</h3>
                <div className="h-[400px] rounded-3xl overflow-hidden border border-gray-100">
                  <MapView 
                    lat={item.latitude} 
                    lng={item.longitude} 
                    itemName={item.item_name} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: CONTACT & SAFETY */}
          <div className="space-y-6">
            
            {/* CONTACT CARD */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)]  top-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-[#111827] rounded-2xl flex items-center justify-center text-xl font-black text-white">
                  {item.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-[#111827] leading-tight">{item.full_name}</h4>
                  <p className="text-sm font-bold text-[#9CA3AF] mt-0.5">Verified Member</p>
                </div>
              </div>

              <button 
                onClick={handleContact}
                disabled={sending}
                className={`w-full py-5 rounded-2xl text-base font-black flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
                  sending
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#22C55E] text-white hover:bg-[#16A34A] shadow-[0_10px_20px_rgba(34,197,94,0.2)]"
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                {sending ? "Connecting..." : "Contact via WhatsApp"}
              </button>

              <p className="mt-6 text-center text-xs font-bold text-[#9CA3AF] leading-relaxed">
                Your safety is our priority. Always meet in a public, well-lit area when exchanging items.
              </p>
            </div>

            {/* SAFETY TIPS CARD */}
            <div className="bg-[#FFF1F2] rounded-[2rem] p-8 border border-[#FFE4E6]">
              <div className="flex items-center gap-2 mb-4 text-[#E11D48]">
                <ShieldAlert className="w-5 h-5" />
                <h4 className="font-black uppercase tracking-widest text-xs">Safety & Trust</h4>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3 text-xs font-bold text-[#9F1239] leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-1 shrink-0" />
                  Never send money for shipping before verifying the item's existence.
                </li>
                <li className="flex gap-3 text-xs font-bold text-[#9F1239] leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E11D48] mt-1 shrink-0" />
                  Ask for a specific detail or photo not shown in the original post.
                </li>
              </ul>

              {/* Report Button */}
              <button 
                onClick={handleReport}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#E11D48]/30 rounded-xl text-[#E11D48] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#E11D48] hover:text-white transition-all group"
              >
                <AlertTriangle className="w-3.5 h-3.5 group-hover:animate-pulse" />
                Report Post
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ItemDetail;