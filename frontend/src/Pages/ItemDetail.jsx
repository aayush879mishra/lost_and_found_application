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
          className="mb-6 text-gray-500 font-bold hover:text-gray-800 transition flex items-center gap-2"
        >
          ← Go Back
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white">
          
          {/* LEFT: IMAGE SECTION */}
          <div className="md:w-1/2 bg-gray-50 relative">
            <img 
              src={`http://localhost:5000${item.image}`} 
              alt={item.item_name} 
              className="w-full h-full object-cover min-h-[450px] max-h-[600px]"
            />
            <div className={`absolute top-6 left-6 px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg ${
              item.type === 'lost' ? 'bg-[#FF6B6B] text-white' : 'bg-green-500 text-white'
            }`}>
              {item.type}
            </div>
          </div>

          {/* RIGHT: CONTENT SECTION */}
          <div className="md:w-1/2 p-8 md:p-14 flex flex-col">
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Posted {new Date(item.created_at).toLocaleDateString()}
                </span>
                <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                  {item.category}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter leading-tight">
                {item.item_name}
              </h1>
              
              <p className="text-xl text-[#3D7D24] font-black mb-6 flex items-center gap-2">
                <span className="text-2xl text-gray-800">📍</span> {item.location}
              </p>

              {/* MAP SECTION */}
              {item.latitude && item.longitude ? (
                <div className="h-64 w-full mb-8 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner relative z-10">
                  <MapView 
                    lat={item.latitude} 
                    lng={item.longitude} 
                    itemName={item.item_name} 
                  />
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center bg-gray-50 rounded-2xl mb-8 border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No map coordinates provided</p>
                </div>
              )}

              <div className="space-y-6 pt-4 border-t border-gray-100">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed font-medium text-lg">
                    {item.description || "The owner did not provide a detailed description."}
                  </p>
                </div>
              </div>
            </div>

            {/* CONTACT BOX */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-tr from-[#FF6B6B] to-orange-300 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg">
                  {item.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest m-0">Reported By</p>
                  <p className="text-xl font-black text-gray-800 m-0">{item.full_name}</p>
                </div>
              </div>

              <button 
      onClick={handleContact}
      disabled={sending} // Disable button while sending
      className={`w-full py-5 rounded-[1.8rem] font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${
        sending 
          ? "bg-gray-400 cursor-not-allowed" 
          : "bg-[#25D366] hover:bg-[#1eb959] text-white shadow-green-100"
      }`}
    >
      {sending ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </>
      ) : (
        <>
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">

                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.512-2.96-2.626-.087-.115-.708-.941-.708-1.797 0-.856.448-1.277.607-1.45.159-.174.347-.218.462-.218.116 0 .232.001.332.005.109.004.255-.041.399.305.144.347.491 1.197.535 1.284.044.087.073.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.088.275.073.376-.044.101-.116.433-.506.549-.68.116-.174.231-.145.39-.087s1.011.477 1.184.564c.174.087.289.13.332.202.045.072.045.419-.1.824z"/>

                  <path fillRule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5-1.338A9.91 9.91 0 0012 22zm0-2c-1.597 0-3.085-.468-4.335-1.278l-.311-.202-2.602.693.693-2.602-.202-.311A7.953 7.953 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/>

                </svg>
          Contact via WhatsApp
        </>
      )}
    </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;