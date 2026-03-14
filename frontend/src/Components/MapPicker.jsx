import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
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
// --------------------------

function MapPicker({ setLocation }) {
  // Default center (Example: Kathmandu, Nepal)
  const [position, setPosition] = useState([27.7172, 85.3240]);

  // Sub-component to handle map click events
  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setLocation({ lat, lng }); // Sends coordinates to parent form
      },
    });

    return position === null ? null : (
      <Marker position={position} />
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm">
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: "300px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
      <div className="bg-slate-100 p-2 text-center">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Coordinates: {position[0].toFixed(5)}, {position[1].toFixed(5)}
        </p>
      </div>
    </div>
  );
}

export default MapPicker;