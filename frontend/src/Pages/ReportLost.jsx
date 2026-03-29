import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MapPicker from "../Components/MapPicker";

function ReportLost() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
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
    phone: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
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
      alert("Please select location on map.");
      return;
    }

    setLoading(true);

    const data = new FormData();
    Object.entries({ ...formData, type: "lost" }).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (image) data.append("image", image);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/items/post", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Report submitted successfully.");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8EDEB] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-medium text-gray-500 hover:text-gray-800 transition"
        >
          ← Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800">
              Report Lost Item
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Provide accurate details to increase the chance of recovery.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
              <input
                type="text"
                name="item_name"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 outline-none"
                >
                  <option value="">Select</option>
                  <option>Electronics</option>
                  <option>Pets</option>
                  <option>Documents</option>
                  <option>Wallets/Bags</option>
                  <option>Others</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Lost</label>
                <input
                  type="date"
                  name="date"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 outline-none"
                placeholder="977XXXXXXXXXX"
              />
              <p className="text-[12px] text-red-300 mt-1 ml-1 italic font-medium uppercase tracking-tighter"> * Include country code without the '+' sign for direct messaging. </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pin Location</label>
              <div className="rounded-xl overflow-hidden border border-gray-300">
                <MapPicker setLocation={handleLocationSelect} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location Description</label>
              <input
                type="text"
                name="location"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Description</label>
              <textarea
                name="description"
                rows="3"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Upload Image</label>

              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-900 file:text-white hover:file:bg-black"
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-black transition active:scale-[0.98] disabled:bg-gray-400"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReportLost;