import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MapView from "../Components/MapView";

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

  // Trigger Email Notification
  try {
    // 1. Trigger the email notification
      await axios.post("http://localhost:5000/api/items/notify-connection", {
        ownerEmail: item.email,
        ownerName: item.full_name,
        itemName: item.item_name,
        requesterName: user.full_name,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
  } catch (err) {
    console.error("Notification failed to trigger:", err);
  }

 finally {
      // 2. Draft message and open WhatsApp
      const message = `Hi ${item.full_name || "there"}, I saw your report on LostLink for the ${item.type} item: "${item.item_name}". I'd like to discuss this with you.`;
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, "_blank");
      
      // Reset loading state after a small delay so the transition feels smooth
      setTimeout(() => setSending(false), 1000);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8EDEB]">
      <div className="animate-pulse font-black text-gray-400 text-2xl uppercase tracking-widest">Loading Details...</div>
    </div>
  );

  if (!item) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8EDEB]">
      <div className="text-center">
        <h2 className="text-4xl font-black text-gray-800 mb-4">Item Not Found</h2>
        <button onClick={() => navigate("/")} className="text-[#FF6B6B] font-bold underline">Return Home</button>
      </div>
    </div>
  );

  return (
  <div className="min-h-screen bg-[#F8EDEB] py-12 px-4">
    <div className="max-w-6xl mx-auto">

      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 text-sm text-gray-600 hover:text-gray-800 transition flex items-center gap-2"
      >
        ← Back
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* IMAGE */}
        <div className="md:w-1/2 bg-gray-100 relative">
          <img 
            src={`http://localhost:5000${item.image}`} 
            alt={item.item_name} 
            className="w-full h-full object-cover min-h-[420px]"
          />

          <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-medium uppercase rounded ${
            item.type === 'lost'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}>
            {item.type}
          </span>
        </div>

        {/* CONTENT */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
          
          <div className="flex-grow">

            {/* meta */}
            <div className="flex justify-between items-center mb-4 text-xs text-gray-400">
              <span className="text-gray-700">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
              <span className="border border-gray-200 px-2 py-0.5 rounded text-gray-700 uppercase">
                {item.category}
              </span>
            </div>

            {/* title */}
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3 leading-tight">
              {item.item_name}
            </h1>
            
            {/* location */}
            <p className="text-gray-600 text-sm mb-6 flex items-center gap-2">
              📍 {item.location}
            </p>

            {/* MAP */}
            {item.latitude && item.longitude ? (
              <div className="h-56 w-full mb-8 rounded-lg overflow-hidden border border-gray-200">
                <MapView 
                  lat={item.latitude} 
                  lng={item.longitude} 
                  itemName={item.item_name} 
                />
              </div>
            ) : (
              <div className="h-20 flex items-center justify-center bg-gray-50 rounded-lg mb-8 border border-dashed border-gray-200">
                <p className="text-gray-400 text-xs">
                  No location provided
                </p>
              </div>
            )}

            {/* description */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">
                Description
              </h3>
              <p className="text-gray-700  leading-relaxed">
                {item.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* CONTACT */}
          <div className="mt-8 pt-6 border-t border-gray-100">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-semibold">
                {item.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-400">Reported by</p>
                <p className="text-sm font-medium text-gray-800">
                  {item.full_name}
                </p>
              </div>
            </div>

            <button 
              onClick={handleContact}
              disabled={sending}
              className={`w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
                sending
                  ? "bg-gray-300 text-white cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-800"
              }`}
            >
              {sending ? "Connecting..." : "Contact via WhatsApp"}
            </button>

          </div>
        </div>
      </div>
    </div>
  </div>
);
}

export default ItemDetail;