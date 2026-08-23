import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

const COLORS = { police: '#1d4ed8', hospital: '#dc2626', clinic: '#059669', pharmacy: '#7c3aed' };
const EMOJI = { police: '🚓', hospital: '🏥', clinic: '➕', pharmacy: '💊' };

function icon(type) {
  return L.divIcon({
    className: '',
    html: `<div style="width:34px;height:34px;border-radius:50%;background:${COLORS[type]};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,0.3);border:2px solid #fff;font-size:16px;">${EMOJI[type]}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });
}

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 13); }, [center, map]);
  return null;
}

export default function EmergencyServiceMap({ center, services = [], height = '55vh' }) {
  const fallback = [19.076, 72.8777];
  const view = center || fallback;
  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-soft" style={{ height }}>
      <MapContainer center={view} zoom={13} scrollWheelZoom className="h-full w-full" style={{ height: '100%' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CARTO' />
        <Recenter center={view} />
        {services.map((s, i) => (
          <Marker key={s.id || i} position={[s.location_lat, s.location_lng]} icon={icon(s.type)}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{s.type}{s.open_24h ? ' · 24h' : ''}</p>
                {s.address && <p className="text-xs mt-0.5">{s.address}</p>}
                <a href={`tel:${s.phone?.replace(/[^\d+]/g,'')}`} className="text-xs text-primary font-medium mt-1 inline-block">📞 {s.phone}</a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}