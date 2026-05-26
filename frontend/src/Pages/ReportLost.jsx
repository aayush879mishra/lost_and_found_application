import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  FileText, 
  MapPin, 
  Camera, 
  MessageCircle, 
  UploadCloud, 
  ChevronLeft,
  ChevronDown,
  Loader2 
} from "lucide-react"; 
import MapPicker from "../Components/MapPicker";

function ReportLost() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const [loading, setLoading] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(false); 

  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    location: "",
    address_name: "", // Added to map seamlessly with your backend body parser
    description: "",
    date: "",
    latitude: null,
    longitude: null,
    phone: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData({ ...formData, phone: value.replace(/\D/g, "") });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLocationSelect = async (coords) => {
    setFormData((prev) => ({
      ...prev,
      latitude: coords.lat,
      longitude: coords.lng,
    }));

    setFetchingAddress(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`
      );
      
      if (response.data && response.data.display_name) {
        const fullAddress = response.data.display_name;
        
        setFormData((prev) => ({
          ...prev,
          address_name: fullAddress,
          // Automatically pre-fill the manual location input field if empty
          location: prev.location || response.data.name || fullAddress.split(",")[0]
        }));
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
      setFormData((prev) => ({
        ...prev,
        address_name: `Pinned Coords: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
      }));
    } finally {
      setFetchingAddress(false);
    }
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
      toast.error("Please pin the location on the map.");
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
      toast.success("Report submitted successfully! It has been sent for admin approval and will appear in the feed once verified.", {
  duration: 6000,
  position: "top-center" // Optional: keeps it prominent at the top center of the screen
});
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-16 px-4 antialiased font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-12">
          <h1 className="text-[42px] font-[800] text-[#111827] mb-3 tracking-[-0.03em] leading-tight">
            Report a Lost Item
          </h1>
          <p className="text-[#6B7280] text-lg font-medium tracking-tight">
            Help the community find what you've lost by being as descriptive as possible.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* SECTION 1: ITEM DETAILS */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F3F4F6]">
            <div className="flex items-center mb-10">
              <div className="p-3 bg-[#EEF2FF] rounded-2xl mr-4">
                <FileText className="w-6 h-6 text-[#4F46E5]" />
              </div>
              <h3 className="text-[22px] font-bold text-[#1F2937] tracking-tight">Item Details</h3>
            </div>
            
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-[11px] font-bold text-[#9CA3AF] mb-3 uppercase tracking-[0.15em]">Category</label>
                  <div className="relative">
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-[#F3F4F6] p-5 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[#4F46E5]/10 transition font-medium text-[#1F2937] appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select Category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Pets">Pets</option>
                      <option value="Documents">Documents</option>
                      <option value="Wallets">Wallets & Bags</option>
                      <option value="Keys">Keys</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Others">Others</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#9CA3AF] mb-3 uppercase tracking-[0.15em]">Item Title</label>
                  <input
                    type="text"
                    name="item_name"
                    placeholder="e.g. Blue Nike Backpack"
                    required
                    value={formData.item_name}
                    onChange={handleChange}
                    className="w-full bg-[#F3F4F6] p-5 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[#4F46E5]/10 transition placeholder:text-[#9CA3AF] font-medium"
                  />
                </div>
              </div>

              {/* DYNAMIC ADDRESS LINK IN ITEM DETAILS */}
              {(fetchingAddress || formData.address_name) && (
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[1.25rem] p-4 flex items-center gap-3 transition-all">
                  <MapPin className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-xs font-semibold text-[#4B5563]">
                    {fetchingAddress ? (
                      <span className="flex items-center gap-2 text-[#9CA3AF]">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Resolving map address...
                      </span>
                    ) : (
                      <span>Linked Location: <span className="font-normal text-[#6B7280]">{formData.address_name}</span></span>
                    )}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#9CA3AF] mb-3 uppercase tracking-[0.15em]">Detailed Description</label>
                <textarea
                  name="description"
                  rows="5"
                  placeholder="Include distinctive features, brand, color, or specific wear and tear..."
                  onChange={handleChange}
                  className="w-full bg-[#F3F4F6] p-5 rounded-[1.25rem] outline-none focus:ring-2 focus:ring-[#4F46E5]/10 transition placeholder:text-[#9CA3AF] resize-none font-medium leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: LOCATION */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F3F4F6]">
            <div className="flex items-center mb-10">
              <div className="p-3 bg-[#EEF2FF] rounded-2xl mr-4">
                <MapPin className="w-6 h-6 text-[#4F46E5]" />
              </div>
              <h3 className="text-[22px] font-bold text-[#1F2937] tracking-tight">Where did you lose it?</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-[11px] font-bold text-[#9CA3AF] mb-3 uppercase tracking-[0.15em]">Date of Loss</label>
                <input
                  type="date"
                  name="date"
                  required
                  onChange={handleChange}
                  className="w-full bg-[#F3F4F6] p-5 rounded-[1.25rem] outline-none font-medium text-[#1F2937] cursor-text"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#9CA3AF] mb-3 uppercase tracking-[0.15em]">Location Description</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Near the food court"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-[#F3F4F6] p-5 rounded-[1.25rem] outline-none placeholder:text-[#9CA3AF] font-medium"
                />
              </div>
            </div>

            <label className="block text-[11px] font-bold text-[#9CA3AF] mb-3 uppercase tracking-[0.15em]">Pin Location on Map</label>
            <div className="rounded-[1.5rem] overflow-hidden border border-[#E5E7EB] h-80 bg-[#F9FAFB] relative shadow-inner mb-4">
              <MapPicker setLocation={handleLocationSelect} />
            </div>

            {/* DYNAMIC DROPPED PIN ADDRESS DISPLAY */}
            {(fetchingAddress || formData.address_name) && (
              <div className="bg-[#F5F7FF] rounded-[1.25rem] p-4 border border-[#E0E7FF] flex items-start gap-3 animate-fadeIn">
                <MapPin className="w-5 h-5 text-[#4F46E5] shrink-0 mt-0.5" />
                <div className="text-sm font-medium text-[#374151]">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-[#4F46E5] mb-1">Selected Place:</span>
                  {fetchingAddress ? (
                    <div className="flex items-center gap-2 text-[#6B7280]">
                      <Loader2 className="w-4 h-4 animate-spin text-[#4F46E5]" />
                      Finding address name...
                    </div>
                  ) : (
                    <p className="leading-relaxed">{formData.address_name}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: MEDIA & CONTACT */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F3F4F6]">
            <div className="flex items-center mb-10">
              <div className="p-3 bg-[#EEF2FF] rounded-2xl mr-4">
                <Camera className="w-6 h-6 text-[#4F46E5]" />
              </div>
              <h3 className="text-[22px] font-bold text-[#1F2937] tracking-tight">Media & Contact</h3>
            </div>

            <label className="block text-[11px] font-bold text-[#9CA3AF] mb-4 uppercase tracking-[0.15em]">Photos</label>
            <div className="border-2 border-dashed border-[#D1D5DB] rounded-[2rem] p-10 text-center hover:bg-[#F9FAFB] transition-all relative group cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="mx-auto w-48 h-48 object-cover rounded-[1.5rem] shadow-lg" />
                  <div className="absolute inset-0 bg-black/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-[2px]">
                    <p className="text-white text-xs font-bold uppercase tracking-wider">Change Photo</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="p-5 bg-[#EEF2FF] rounded-full mb-5">
                    <UploadCloud className="w-10 h-10 text-[#4F46E5]" />
                  </div>
                  <p className="text-lg font-bold text-[#374151] tracking-tight">Click to upload or drag and drop</p>
                </div>
              )}
            </div>

            <div className="mt-12">
              <label className="block text-[11px] font-bold text-[#9CA3AF] mb-3 uppercase tracking-[0.15em]">Contact Number</label>
              <div className="flex items-center gap-5">
                <input
                  type="tel"
                  name="phone"
                  placeholder="97798xxxxxxxx"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="flex-1 bg-[#F3F4F6] p-5 rounded-[1.25rem] outline-none placeholder:text-[#9CA3AF] font-medium"
                />
                <div className="p-5 bg-[#DCFCE7] rounded-[1.25rem] border border-[#BBF7D0]">
                  <MessageCircle className="w-7 h-7 text-[#16A34A]" />
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-[#4F46E5] font-bold hover:text-[#4338CA] transition flex items-center gap-2 group text-lg"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#4F46E5] text-white px-14 py-5 rounded-[1.5rem] font-bold text-lg shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] hover:bg-[#4338CA] transition-all transform hover:-translate-y-1 active:scale-95 disabled:bg-[#9CA3AF] disabled:transform-none"
            >
              {loading ? "Posting Report..." : "Post Lost Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportLost;