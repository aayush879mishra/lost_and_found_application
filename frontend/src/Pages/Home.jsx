import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import mainImg from "../assets/myphoto.jpg"; 

function Home() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state

  // Fetch the latest items
  useEffect(() => {
    setLoading(true);
    axios.get("http://localhost:5000/api/items/feed")
      .then(res => {
        // IMPROVEMENT: Filter out 'resolved' items and show only active ones
        const activeItems = res.data.filter(item => item.status !== 'resolved');
        setItems(activeItems.slice(0, 6)); 
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#F8EDEB] to-[#E9F7D8]">
      
      {/* HERO SECTION - Kept exactly as your original */}
      <div className="flex flex-col md:flex-row justify-between items-center px-8 md:px-20 py-16 gap-10">
        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-gray-900">
            Find & <br /> Recover <br /> <span className="text-[#3D7D24]">With Ease</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-md">
            Experience effortless recovery with our dedicated lost and found service. 
            Connect with your belongings in just a few clicks.
          </p>
          <div className="flex gap-4 pt-4">
            <button onClick={() => navigate("/report-lost")} className="bg-[#FF6B6B] hover:bg-[#ff5252] text-white px-8 py-3 rounded-lg text-xl font-semibold shadow-lg transition-all">
              Lost Something?
            </button>
            <button onClick={() => navigate("/report-found")} className="bg-[#4CAF50] hover:bg-[#43a047] text-white px-8 py-3 rounded-lg text-xl font-semibold shadow-lg transition-all">
              Found Something?
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          <img src={mainImg} alt="Hero" className="w-[90%] max-w-md rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300" />
        </div>
      </div>

      {/* IMPROVED LIVE FEED SECTION */}
      <div className="px-8 md:px-20 py-12">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-8 bg-[#FF6B6B] rounded-full"></span>
            Recent Activity
          </h2>
          <Link to="/all-items" className="text-[#3D7D24] font-bold hover:underline">View All →</Link>
        </div>

        {loading ? (
          /* Loading Placeholder */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <Link 
                to={`/item/${item.type}/${item.id}`} // Simplified route
                key={`${item.type}-${item.id}`} 
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group flex flex-col h-full"
              >
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {/* IMPROVEMENT: Fallback for broken/missing images */}
                  <img 
  loading="lazy"
  src={item.image ? `http://localhost:5000${item.image}` : "https://placehold.co/400x300?text=No+Image"} 
  alt={item.item_name} 
  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
  onError={(e) => {
    // If the server image is missing or the placeholder fails, use this final fallback
    e.target.onerror = null; 
    e.target.src = "https://placehold.co/400x300?text=Image+Not+Found";
  }}
/>
                  <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black uppercase shadow-sm ${
                    item.type === 'lost' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {item.type}
                  </span>
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{item.item_name}</h3>
                    <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded uppercase text-gray-500">
                       {item.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-500 text-sm mt-2 flex items-center gap-1">
                    📍 {item.location}
                  </p>

                  <div className="mt-auto pt-4 flex justify-between items-center border-t border-gray-50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span  className="text-[#3D7D24] font-bold text-sm group-hover:translate-x-1 transition-transform">
                      Details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No recent reports found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;