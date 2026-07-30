import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet's default marker images don't resolve correctly through Vite's
// bundler — rather than fight that, every marker on this map is a small
// colored div icon built from our own palette, which also looks more
// intentional than the default blue Leaflet pin.
function dotIcon(color, { pulse = false, size = 16 } = {}) {
  return L.divIcon({
    className: "",
    html: `<span style="
        display:block; width:${size}px; height:${size}px; border-radius:50%;
        background:${color}; border:2px solid white; box-shadow:0 1px 4px rgba(11,30,45,0.35);
        ${pulse ? "animation: havenslight-pulse 1.6s ease-in-out infinite;" : ""}
      "></span>
      <style>
        @keyframes havenslight-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.75; }
        }
      </style>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/**
 * markers: [{ id, lat, lng, color, label, popup, pulse?, size? }]
 * center: { lat, lng } — required, this is what the map focuses on
 * radiusMeters: optional — draws a soft circle around center (e.g. the
 * "nearby" search radius) so the coverage area is visible, not just implied
 */
export default function LiveMap({ center, zoom = 14, markers = [], radiusMeters, height = 320 }) {
  const key = useMemo(
    () => `${center.lat.toFixed(4)}:${center.lng.toFixed(4)}`,
    [center.lat, center.lng]
  );

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-ink/10">
      <MapContainer
        key={key}
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {radiusMeters && (
          <Circle
            center={[center.lat, center.lng]}
            radius={radiusMeters}
            pathOptions={{ color: "#1F8A82", weight: 1, fillColor: "#1F8A82", fillOpacity: 0.06 }}
          />
        )}
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={dotIcon(m.color, { pulse: m.pulse, size: m.size })}
          >
            {(m.label || m.popup) && (
              <Popup>
                <div className="text-sm">
                  {m.label && <p className="font-semibold text-ink">{m.label}</p>}
                  {m.popup && <p className="text-ink-soft">{m.popup}</p>}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
