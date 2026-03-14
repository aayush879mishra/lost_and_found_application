import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/items/feed";
const LIMIT = 9;

const CATEGORIES = [
  "All",
  "Electronics",
  "Pets",
  "Documents",
  "Wallets/Bags",
  "Keys",
  "Others",
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

  // 🔄 Fetch items from backend
  const fetchItems = async (reset = false, isIgnore = () => false) => {
    // Basic guards: Don't fetch if loading, or if we've reached the end
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

      // 🛑 STOPS DUPLICATES: If this effect was cleaned up by React, don't update state
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

  // 🔄 Handle Filters & Initial Mount (Single Entry Point)
  useEffect(() => {
    let ignore = false; // Flag to prevent Strict Mode double-firing

    setItems([]);
    setPage(1);
    setHasMore(true);

    // Initial fetch for a clean state
    fetchItems(true, () => ignore);

    return () => {
      ignore = true; // Mark this fetch as "stale" if search/category changes quickly
    };
  }, [category, type, search]);

  // 🔄 Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only trigger if: Visible AND Not Loading AND Has More AND already has first batch
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
    <div className="min-h-screen bg-[#F8EDEB] pb-20">
      {/* HEADER */}
      <header className="bg-white px-8 py-8 border-b">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-4xl font-black">Explore Lost & Found</h1>

          <div className="flex flex-wrap gap-4 items-center">
            <input
              placeholder="Search by item or location..."
              className="px-6 py-4 rounded-2xl bg-gray-100 font-semibold focus:ring-2 focus:ring-[#FF6B6B] outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex bg-gray-100 p-1 rounded-2xl">
              {["all", "lost", "found"].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-6 py-2 rounded-xl uppercase font-black text-xs transition-all ${
                    type === t ? "bg-black text-white shadow-lg" : "text-gray-500 hover:text-black"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* CATEGORY FILTER */}
      <div className="max-w-7xl mx-auto px-8 py-6 flex flex-wrap gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
              category === cat
                ? "bg-[#FF6B6B] text-white shadow-md shadow-red-200"
                : "bg-white text-gray-500 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ITEMS GRID */}
      <div className="max-w-7xl mx-auto px-8 py-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.id}`} // ✅ UNIQUE COMPOSITE KEY
            to={`/item/${item.type}/${item.id}`}
            className="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
          >
            <div className="relative h-52 bg-gray-200 overflow-hidden">
              <img
                loading="lazy"
                src={item.image ? `http://localhost:5000${item.image}` : "https://placehold.co/400x300?text=No+Image"}
                alt={item.item_name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/400x300?text=Image+Not+Found";
                }}
              />
              <span
                className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                  item.type === "lost" ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                }`}
              >
                {item.type}
              </span>
            </div>

            <div className="p-6">
              <h3 className="font-black text-xl text-slate-800 line-clamp-1 group-hover:text-[#FF6B6B] transition-colors">
                {item.item_name}
              </h3>
              <div className="flex items-center gap-1 mt-2 text-slate-400">
                <span className="text-sm">📍</span>
                <p className="text-xs font-bold uppercase tracking-tight line-clamp-1">{item.location}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* INFINITE SCROLL TRIGGER */}
      {hasMore && (
        <div ref={observerRef} className="text-center py-20">
          {loading ? (
            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-[#FF6B6B] rounded-full animate-spin"></div>
          ) : (
            <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Scroll to load more</p>
          )}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && items.length === 0 && (
        <div className="text-center py-32 animate-fade-in">
          <p className="text-6xl mb-6">🔍</p>
          <h2 className="text-2xl font-black text-slate-800">No matches found</h2>
          <p className="text-slate-400 font-medium mt-2">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}

export default AllItems;