import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Leaflet Marker Fix ---
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;
//

function MapView({ lat, lng, itemName }) {
  // Ensure coordinates are numbers
  const position = [parseFloat(lat), parseFloat(lng)];

  return (
    <div className="rounded-3xl overflow-hidden border-4 border-white shadow-xl h-full min-h-[300px]">
      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup className="font-bold text-[#FF6B6B]">
            {itemName || "Item Location"}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default MapView;