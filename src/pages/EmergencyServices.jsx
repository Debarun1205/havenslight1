import { useEffect, useMemo, useState } from 'react';
import { Ambulance, Phone, MapPin, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import EmergencyServiceMap from '@/components/map/EmergencyServiceMap';
import { useGeolocation } from '@/hooks/useGeolocation';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const TYPES = [
  { key: 'all', label: 'All', icon: MapPin, color: 'text-foreground' },
  { key: 'hospital', label: 'Hospitals', icon: Ambulance, color: 'text-red-600' },
  { key: 'police', label: 'Police', icon: MapPin, color: 'text-blue-600' },
  { key: 'clinic', label: 'Clinics', icon: Ambulance, color: 'text-green-600' },
  { key: 'pharmacy', label: 'Pharmacy', icon: MapPin, color: 'text-violet-600' },
];

export default function EmergencyServices() {
  const { location, request } = useGeolocation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    base44.entities.EmergencyService.list().then(setServices).finally(() => setLoading(false));
    request().catch(() => {});
  }, []);

  const filtered = useMemo(() => services.filter((s) => filter === 'all' || s.type === filter), [services, filter]);
  const center = location ? [location.lat, location.lng] : null;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
          <Ambulance className="w-4 h-4" /> Emergency near you
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">Emergency Services Map</h1>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
          Nearby police stations, hospitals, clinics and pharmacies — categorized by the kind of emergency, with tap-to-call.
        </p>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mt-5">
          {TYPES.map((t) => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={cn('flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all',
                filter === t.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/40')}>
              <t.icon className={cn('w-4 h-4', filter === t.key ? 'text-primary-foreground' : t.color)} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="rounded-2xl bg-secondary animate-pulse" style={{ height: '55vh' }} />
          ) : (
            <EmergencyServiceMap center={center} services={filtered} />
          )}
        </div>

        {/* List */}
        <div className="grid sm:grid-cols-2 gap-3 mt-6">
          {filtered.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                s.type === 'hospital' ? 'bg-red-100' : s.type === 'police' ? 'bg-blue-100' :
                s.type === 'clinic' ? 'bg-green-100' : 'bg-violet-100')}>
                <Ambulance className={cn('w-5 h-5',
                  s.type === 'hospital' ? 'text-red-600' : s.type === 'police' ? 'text-blue-600' :
                  s.type === 'clinic' ? 'text-green-600' : 'text-violet-600')} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{s.type} · {s.city}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {s.open_24h && <span className="text-[10px] flex items-center gap-0.5 text-green-600 font-medium"><Clock className="w-2.5 h-2.5" /> 24h</span>}
                  {s.address && <span className="text-[11px] text-muted-foreground truncate">{s.address}</span>}
                </div>
              </div>
              <a href={`tel:${s.phone?.replace(/[^\d+]/g,'')}`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shrink-0">
                <Phone className="w-4 h-4" /> Call
              </a>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}