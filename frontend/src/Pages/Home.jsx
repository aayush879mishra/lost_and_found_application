import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  ArrowRight,
  Globe,
  Mail
} from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get("http://localhost:5000/api/items/feed")
      .then(res => {
        const activeItems = res.data.filter(item => item.status !== 'resolved');
        setItems(activeItems.slice(0, 3)); // Showing top 3 like the screenshot
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      
      {/* --- HERO SECTION --- */}
      <div className="max-w-4xl mx-auto px-6 py-28 text-center">
        <h1 className="text-6xl md:text-[80px] font-[800] text-[#111827] leading-[1.1] tracking-[-0.04em] mb-6">
          Find what's lost. <br />
          <span className="bg-gradient-to-r from-[#5D46F6] to-[#4338CA] bg-clip-text text-transparent">
            Restore the peace.
          </span>
        </h1>
        
        <p className="text-[#6B7280] text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed mb-12 tracking-tight">
          A professional curator for misplaced belongings. Whether you've lost a treasure or found a memory, we help bridge the gap.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate("/report-lost")}
            className="group flex items-center gap-2 bg-[#F3F4F6] text-[#1F2937] px-8 py-4 rounded-2xl font-bold hover:bg-[#E5E7EB] transition-all"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Report Lost Item
          </button>

          <button
            onClick={() => navigate("/report-found")}
            className="group flex items-center gap-2 bg-[#F3F4F6] text-[#1F2937] px-8 py-4 rounded-2xl font-bold hover:bg-[#E5E7EB] transition-all"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Report Found Item
          </button>
        </div>
      </div>

      {/* --- RECENT DISCOVERIES (FEED) --- */}
      <div className="max-w-7xl mx-auto px-8 py-20 border-t border-gray-50">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">Recent Discoveries</h2>
            <p className="text-[#9CA3AF] font-medium mt-1">Real-time updates from the network</p>
          </div>
          <Link to="/all-items" className="flex items-center gap-1 text-[#4F46E5] font-bold hover:gap-2 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-[400px] bg-gray-50 animate-pulse rounded-[2rem]"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((item) => (
              <Link 
                to={`/item/${item.type}/${item.id}`}
                key={item.id}
                className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={item.image ? `http://localhost:5000${item.image}` : "https://placehold.co/600x400"} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={item.item_name}
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      item.type === 'lost' ? 'bg-[#FFF1F2] text-[#E11D48]' : 'bg-[#EEF2FF] text-[#4F46E5]'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                </div>
                
                <div className="p-8">
                  <h3 className="text-xl font-bold text-[#1F2937] group-hover:text-[#4F46E5] transition-colors line-clamp-1">
                    {item.item_name}
                  </h3>
                  <p className="text-[#9CA3AF] text-sm font-bold mt-1 uppercase tracking-wider">
                    {item.category} • {item.location}
                  </p>
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-[#D1D5DB] text-xs font-medium">
                      Reported {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-[#4F46E5] font-bold text-sm">View Details</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* --- HOW IT WORKS SECTION --- */}
      <div className="bg-[#F9FAFB] py-28">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-4">How LostLink Works</h2>
          <p className="text-[#6B7280] font-medium mb-20">Three simple steps to bridge the distance between you and your belongings.</p>
          
          <div className="grid md:grid-cols-3 gap-16">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-[#4F46E5]" />
              </div>
              <h4 className="text-xl font-bold text-[#1F2937] mb-3">1. Post a Report</h4>
              <p className="text-[#6B7280] leading-relaxed">Provide details and photos. Fill out a simple form with details and photos of your item to start the recovery process.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-[#4F46E5]" />
              </div>
              <h4 className="text-xl font-bold text-[#1F2937] mb-3">2. Search Catalog</h4>
              <p className="text-[#6B7280] leading-relaxed">Manually search through our database of lost and found items to find a potential match.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-[#4F46E5]" />
              </div>
              <h4 className="text-xl font-bold text-[#1F2937] mb-3">3. Safe Reunion</h4>
              <p className="text-[#6B7280] leading-relaxed">Once a match is verified, we facilitate a secure communication channel via WhatsApp for you to arrange the return.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <h3 className="text-2xl font-black text-[#111827] mb-6">LostLink</h3>
            <p className="text-[#6B7280] max-w-sm leading-relaxed mb-6">
              The world's most compassionate digital curator for lost items. Bridging distances and restoring memories since 2024.
            </p>
            <div className="flex gap-4">
              <Globe className="w-5 h-5 text-[#9CA3AF] hover:text-[#4F46E5] cursor-pointer" />
              <Mail className="w-5 h-5 text-[#9CA3AF] hover:text-[#4F46E5] cursor-pointer" />
            </div>
          </div>
          <div>
            <h5 className="font-bold text-[#111827] mb-6 uppercase text-xs tracking-widest">Platform</h5>
            <ul className="space-y-4 text-[#6B7280] font-medium text-sm">
              
             <Link to= "/all-items" > <li  className="hover:text-[#4F46E5] py-2 cursor-pointer">Browse Items</li> </Link>
               <Link to="/report-lost"> <li className="hover:text-[#4F46E5] py-2 cursor-pointer">Report Lost</li> </Link>
              <Link to="/report-found"> <li className="hover:text-[#4F46E5] py-2 cursor-pointer">Report Found</li> </Link>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-[#111827] mb-6 uppercase text-xs tracking-widest">Support</h5>
            <ul className="space-y-4 text-[#6B7280] font-medium text-sm">
          <li className="hover:text-[#4F46E5] cursor-pointer">Help Center</li>
              <li className="hover:text-[#4F46E5] cursor-pointer">Privacy Policy</li>
              <li className="hover:text-[#4F46E5] cursor-pointer">Terms of Service</li>
              <li className="hover:text-[#4F46E5] cursor-pointer">Contact Us</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 pt-10 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold text-[#D1D5DB] uppercase tracking-widest">
          <p>© 2026 LOSTLINK CURATOR. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <span className="hover:text-[#9CA3AF] cursor-pointer">Safety Guidelines</span>
            <span className="hover:text-[#9CA3AF] cursor-pointer">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;