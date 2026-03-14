import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MapPicker from "../Components/MapPicker";

function ReportLost() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    location: "",
    description: "",
    date: "",
    latitude: null,
    longitude: null,
    phone: "" // 1. Added phone to state
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    // 2. Logic to ensure phone only accepts numbers
    if (e.target.name === "phone") {
      const value = e.target.value.replace(/\D/g, "");
      setFormData({ ...formData, phone: value });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleLocationSelect = (coords) => {
    setFormData((prev) => ({
      ...prev,
      latitude: coords.lat,
      longitude: coords.lng,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      alert("Please select the last seen location on the map.");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("type", "lost");
    data.append("item_name", formData.item_name);
    data.append("category", formData.category);
    data.append("location", formData.location);
    data.append("description", formData.description);
    data.append("date", formData.date);
    data.append("latitude", formData.latitude);
    data.append("longitude", formData.longitude);
    data.append("phone", formData.phone); // 3. Append phone to FormData

    if (image) data.append("image", image);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/items/post", data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      alert("Lost item reported successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to report item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8EDEB] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 text-gray-500 font-bold hover:text-gray-800 transition flex items-center gap-2"
        >
          ← Go Back
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-[#FF6B6B] rounded-full"></div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Report Lost Item</h2>
          </div>
          <p className="text-gray-500 mb-8 font-medium">Provide as much detail as possible to help find your item.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Item Name</label>
              <input 
                type="text" 
                name="item_name" 
                required 
                onChange={handleChange} 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-400 outline-none transition-all font-medium" 
                placeholder="e.g. iPhone 13 Pro" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Category</label>
                <select 
                  name="category" 
                  required 
                  onChange={handleChange} 
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none cursor-pointer font-medium"
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Pets">Pets</option>
                  <option value="Documents">Documents</option>
                  <option value="Wallets/Bags">Wallets/Bags</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Date Lost</label>
                <input 
                  type="date" 
                  name="date" 
                  required 
                  onChange={handleChange} 
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-medium" 
                />
              </div>
            </div>

            {/* WHATSAPP NUMBER SECTION */}
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">WhatsApp Number (with Country Code)</label>
              <input 
                type="tel" 
                name="phone" 
                required 
                value={formData.phone}
                onChange={handleChange} 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-400 outline-none transition-all font-medium" 
                placeholder="e.g. 9779841234567" 
              />
              <p className="text-[12px] text-red-400 mt-1 ml-1 italic font-medium uppercase tracking-tighter">
                * Include country code without the '+' sign for direct messaging.
              </p>
            </div>

            {/* MAP SECTION */}
            <div className="space-y-3">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Pin Last Seen Location</label>
              <MapPicker setLocation={handleLocationSelect} />
              <p className="text-[10px] text-gray-400 italic px-1 font-medium uppercase tracking-tighter">
                Click the map to mark the exact spot where you last had the item.
              </p>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Location Name (Text)</label>
              <input 
                type="text" 
                name="location" 
                required 
                onChange={handleChange} 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-medium" 
                placeholder="e.g. Central Park, near the fountain" 
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Description</label>
              <textarea 
                name="description" 
                rows="3" 
                onChange={handleChange} 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-medium" 
                placeholder="Unique marks, specific colors, or wallpaper description..."
              ></textarea>
            </div>

            <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
              <label className="block text-xs font-black text-red-700 uppercase tracking-widest mb-3 ml-1">Upload Image (Optional)</label>
              
              {imagePreview && (
                <div className="mb-4 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-2xl shadow-md border-2 border-white" />
                  <button 
                    type="button" 
                    onClick={() => {setImage(null); setImagePreview(null);}}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                  >✕</button>
                </div>
              )}

              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#FF6B6B] file:text-white hover:file:bg-[#ff5252] cursor-pointer" 
              />
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:bg-gray-400"
            >
              {loading ? "Posting Report..." : "Submit Lost Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReportLost;