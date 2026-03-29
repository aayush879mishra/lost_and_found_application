import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import mainImg from "../assets/myphoto.jpg"; 

function Home() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get("http://localhost:5000/api/items/feed")
      .then(res => {
        const activeItems = res.data.filter(item => item.status !== 'resolved');
        setItems(activeItems.slice(0, 6)); 
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      
      {/* HERO */}
      <div className="max-w-7xl mx-auto px-8 py-24 flex flex-col md:flex-row items-center gap-16">
  
  {/* LEFT */}
  <div className="flex-1 space-y-8">
    <h1 className="text-4xl md:text-6xl font-semibold text-gray-900 leading-tight tracking-tight">
      Lost & Found,
      <br />
      <span className="text-gray-600">Simplified</span>
    </h1>

    <p className="text-gray-500 max-w-md text-base leading-relaxed">
      A streamlined way to report, discover, and recover lost belongings with clarity and ease.
    </p>

    <div className="flex gap-4 pt-2">
      <button
        onClick={() => navigate("/report-lost")}
        className="bg-gray-900 text-white px-7 py-3 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      >
        Report Lost
      </button>

      <button
        onClick={() => navigate("/report-found")}
        className="border border-gray-300 bg-white text-gray-700 px-7 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-200"
      >
        Report Found
      </button>
    </div>
  </div>

  {/* RIGHT */}
  <div className="flex-1 flex justify-center relative">
    
    {/* subtle background shapes */}
    <div className="absolute -top-8 -left-8 w-32 h-32 bg-gray-200 rounded-full blur-2xl opacity-40"></div>
    <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gray-300 rounded-full blur-2xl opacity-30"></div>

    <img
      src={mainImg}
      alt="Hero"
      className="w-[85%] max-w-sm rounded-2xl border border-gray-200 shadow-lg hover:scale-105 transition-transform duration-500"
    />
  </div>
</div>

      {/* FEED */}
      <div className="max-w-7xl mx-auto px-8 pb-20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Activity
          </h2>

          <Link
            to="/all-items"
            className="text-sm text-gray-500 hover:text-gray-800 transition"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-56 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Link 
                to={`/item/${item.type}/${item.id}`}
                key={`${item.type}-${item.id}`} 
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition group flex flex-col"
              >
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  <img 
                    loading="lazy"
                    src={item.image ? `http://localhost:5000${item.image}` : "https://placehold.co/400x300?text=No+Image"} 
                    alt={item.item_name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "https://placehold.co/400x300?text=Image+Not+Found";
                    }}
                  />

                  <span className={`absolute top-3 right-3 px-2 py-1 text-[10px] font-medium uppercase rounded ${
                    item.type === 'lost'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {item.type}
                  </span>
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-semibold text-gray-800 line-clamp-1">
                      {item.item_name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 border border-gray-200 rounded text-gray-500 uppercase">
                      {item.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-500 text-xs mt-2">
                    📍 {item.location}
                  </p>

                  <div className="mt-auto pt-3 flex justify-between items-center text-xs text-gray-400">
                    <span>
                      {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-gray-600 group-hover:translate-x-1 transition-transform">
                      View
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg bg-white">
            <p className="text-gray-400 text-sm">
              No recent reports available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;