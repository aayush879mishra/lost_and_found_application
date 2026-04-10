import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  Search, 
  Laptop, 
  Dog, 
  FileText, 
  Briefcase, 
  Key, 
  Layers, 
  MapPin, 
  Calendar 
} from "lucide-react";

const API_URL = "http://localhost:5000/api/items/feed";
const LIMIT = 9;

const CATEGORIES = [
  { name: "All", icon: <Layers className="w-4 h-4" /> },
  { name: "Electronics", icon: <Laptop className="w-4 h-4" /> },
  { name: "Pets", icon: <Dog className="w-4 h-4" /> },
  { name: "Documents", icon: <FileText className="w-4 h-4" /> },
  { name: "Accessories", icon: <Briefcase className="w-4 h-4" /> },
  { name: "Keys", icon: <Key className="w-4 h-4" /> },
];

function AllItems() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("all");

  const observerRef = useRef(null);

  const fetchItems = async (reset = false, isIgnore = () => false) => {
    if (loading || (!hasMore && !reset)) return;
    setLoading(true);

    try {
      const res = await axios.get(API_URL, {
        params: {
          page: reset ? 1 : page,
          limit: LIMIT,
          category: category !== "All" ? category : undefined,
          type: type !== "all" ? type : undefined,
          search: search || undefined,
        },
      });

      if (isIgnore()) return;
      const newData = res.data;
      setItems((prev) => (reset ? newData : [...prev, ...newData]));
      setHasMore(newData.length === LIMIT);
      setPage((prev) => (reset ? 2 : prev + 1));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    setItems([]);
    setPage(1);
    setHasMore(true);
    fetchItems(true, () => ignore);
    return () => { ignore = true; };
  }, [category, type, search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore && items.length >= LIMIT) {
          fetchItems();
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, items.length]);

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      
      {/* SEARCH & FILTERS HEADER */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-6 h-6 group-focus-within:text-[#4F46E5] transition-colors" />
            <input
              type="text"
              placeholder="Search for lost keys, wallets, or pets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-6 py-6 bg-white border border-[#E5E7EB] rounded-[2rem] text-lg font-medium shadow-[0_10px_30px_rgba(0,0,0,0.04)] focus:shadow-[0_15px_40px_rgba(79,70,229,0.08)] outline-none transition-all placeholder:text-[#9CA3AF]"
            />
          </div>
        </div>

        {/* TYPE & CATEGORY NAVIGATION */}
        <div className="flex flex-col md:flex-col justify-between items-center gap-8">
          <div className="bg-[#F3F4F6] p-1.5 rounded-2xl flex">
            {["all", "lost", "found"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.1em] transition-all ${
                  type === t ? "bg-white text-[#111827] shadow-sm" : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all border ${
                  category === cat.name
                    ? "bg-[#111827] text-white border-[#111827]"
                    : "bg-[#F9FAFB] text-[#6B7280] border-[#F3F4F6] hover:bg-[#F3F4F6]"
                }`}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ITEMS GRID */}
      <div className="max-w-7xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              to={`/item/${item.type}/${item.id}`}
              className="group bg-white rounded-[2.5rem] overflow-hidden border border-[#F3F4F6] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="relative h-72 overflow-hidden">
                <img
                  loading="lazy"
                  src={item.image ? `http://localhost:5000${item.image}` : "https://placehold.co/600x400"}
                  alt={item.item_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-5 left-5">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    item.type === "lost" ? "bg-[#FFF1F2] text-[#E11D48]" : "bg-[#EEF2FF] text-[#4F46E5]"
                  }`}>
                    {item.type}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#111827] mb-4 group-hover:text-[#4F46E5] transition-colors leading-tight">
                  {item.item_name}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center text-[#6B7280] text-sm font-medium">
                    <MapPin className="w-4 h-4 mr-2 text-[#9CA3AF]" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center text-[#6B7280] text-sm font-medium">
                    <Calendar className="w-4 h-4 mr-2 text-[#9CA3AF]" />
                    <span>
                      {item.type === 'lost' ? 'Lost on ' : 'Found on '}
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#F3F4F6]">
                  <button className="w-full py-4 bg-[#F9FAFB] text-[#111827] font-bold rounded-2xl group-hover:bg-[#5D46F6] group-hover:text-white transition-all">
                    View Details
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* INFINITE SCROLL LOADER */}
        {hasMore && (
          <div ref={observerRef} className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#F3F4F6] border-t-[#4F46E5] rounded-full animate-spin"></div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && items.length === 0 && (
          <div className="text-center py-32 bg-[#F9FAFB] rounded-[3rem] border-2 border-dashed border-[#E5E7EB]">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-sm mb-6">
              <Search className="w-10 h-10 text-[#D1D5DB]" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#111827] mb-2">No results found</h2>
            <p className="text-[#9CA3AF] font-medium max-w-xs mx-auto">
              We couldn't find anything matching your search. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllItems;