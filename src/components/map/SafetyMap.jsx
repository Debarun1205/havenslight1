import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { Siren, Shield, MapPin } from 'lucide-react';

function divIcon(html, color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:34px;height:34px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 14px rgba(0,0,0,0.3);border:2px solid #fff;">
      <div style="transform:rotate(45deg);color:#fff;font-weight:700;">${html}</div>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
}

const userIcon = divIcon('🆘', '#ef4444');
const volIcon = divIcon('🛡', '#0c4a6e');
const selfIcon = divIcon('●', '#0ea5e9');

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14);
  }, [center, map]);
  return null;
}

export default function SafetyMap({ center, userLocation, volunteers = [], activeSOS = [], showVolunteers = true, showSOS = true, height = '60vh' }) {
  const fallback = [19.076, 72.8777]; // Mumbai
  const view = center || userLocation || fallback;

  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-soft" style={{ height }}>
      <MapContainer center={view} zoom={13} scrollWheelZoom className="h-full w-full" style={{ height: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        <Recenter center={view} />
        {userLocation && showSOS === false && (
          <Marker position={userLocation} icon={selfIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {showVolunteers && volunteers.map((v, i) => (
          <Marker key={v.id || i} position={[v.location_lat, v.location_lng]} icon={volIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> {v.display_name}</p>
                <p className="text-xs text-muted-foreground">⭐ {v.rating} · {v.is_on_duty ? 'On duty' : 'Off'}</p>
                {v.skills?.length > 0 && <p className="text-xs mt-1">{v.skills.join(', ')}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
        {showSOS && activeSOS.map((s, i) => (
          <Marker key={s.id || i} position={[s.location_lat, s.location_lng]} icon={userIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold flex items-center gap-1 text-destructive"><Siren className="w-3.5 h-3.5" /> SOS active</p>
                {s.location_label && <p className="text-xs">{s.location_label}</p>}
                <p className="text-xs text-muted-foreground mt-1">{new Date(s.triggered_at).toLocaleTimeString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#ef4444]" /> Active SOS</span>
      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#0c4a6e]" /> Guardian on duty</span>
      <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Your location</span>
    </div>
  );
}