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

    return () => {
      ignore = true;
    };
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
    <div className="min-h-screen bg-[#F4F6F8] pb-24">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
            Lost & Found Directory
          </h1>

          <div className="mt-6 flex flex-wrap gap-4 items-center">
            <input
              placeholder="Search items or locations"
              className="px-5 py-3 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-gray-800 focus:outline-none transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              {["all", "lost", "found"].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-5 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    type === t
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-500 hover:bg-gray-100"
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
      <div className="max-w-7xl mx-auto px-8 py-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition border ${
              category === cat
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ITEMS GRID */}
      <div className="max-w-7xl mx-auto px-8 py-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            to={`/item/${item.type}/${item.id}`}
            className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition overflow-hidden group"
          >
            <div className="relative h-52 bg-gray-100 overflow-hidden">
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
              <span
                className={`absolute top-3 right-3 px-3 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide ${
                  item.type === "lost"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {item.type}
              </span>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                {item.item_name}
              </h3>

              <div className="mt-2 flex items-center text-gray-500 text-xs">
                <span className="mr-1">📍</span>
                <p className="uppercase tracking-wide line-clamp-1">
                  {item.location}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* INFINITE SCROLL */}
      {hasMore && (
        <div ref={observerRef} className="text-center py-16">
          {loading ? (
            <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
          ) : (
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              Scroll to load more
            </p>
          )}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && items.length === 0 && (
        <div className="text-center py-28">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="text-xl font-semibold text-gray-700">
            No results found
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Try refining your search or filters
          </p>
        </div>
      )}
    </div>
  );
}

export default AllItems;