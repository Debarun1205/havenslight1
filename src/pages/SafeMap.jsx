import { useEffect, useState } from 'react';
import { Map, Siren, Shield, Activity, Locate, Eye, EyeOff } from 'lucide-react';
import Layout from '@/components/Layout';
import SafetyMap, { MapLegend } from '@/components/map/SafetyMap';
import { useMode } from '@/components/ModeContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function SafeMapPage() {
  const { mode, onDuty, setOnDuty } = useMode();
  const isVolunteer = mode === 'volunteer';
  const { location, request } = useGeolocation();
  const [volunteers, setVolunteers] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [myVolunteer, setMyVolunteer] = useState(null);

  const loadAll = () => {
    base44.entities.Volunteer.filter({ is_on_duty: true }).then(setVolunteers).catch(() => {});
    base44.entities.SOSAlert.filter({ status: 'active' }).then(setSosAlerts).catch(() => {});
    base44.entities.Volunteer.list().then((rows) => setMyVolunteer(rows[0] || null)).catch(() => {});
  };

  useEffect(() => { loadAll(); const t = setInterval(loadAll, 15000); return () => clearInterval(t); }, []);
  useEffect(() => { request().catch(() => {}); }, []);

  const goOnDuty = async () => {
    let loc = location;
    if (!loc) { try { loc = await request(); } catch { /* null */ } }
    if (myVolunteer) {
      const updated = await base44.entities.Volunteer.update(myVolunteer.id, {
        is_on_duty: true,
        location_lat: loc?.lat ?? myVolunteer.location_lat,
        location_lng: loc?.lng ?? myVolunteer.location_lng,
        last_seen: new Date().toISOString(),
      });
      setMyVolunteer(updated);
    } else {
      const created = await base44.entities.Volunteer.create({
        display_name: 'You (Guardian)',
        is_on_duty: true,
        location_lat: loc?.lat ?? 19.076,
        location_lng: loc?.lng ?? 72.8777,
        last_seen: new Date().toISOString(),
        skills: ['First aid', 'Local knowledge'],
        rating: 5.0,
      });
      setMyVolunteer(created);
    }
    setOnDuty(true);
    loadAll();
  };

  const goOffDuty = async () => {
    if (myVolunteer) {
      await base44.entities.Volunteer.update(myVolunteer.id, { is_on_duty: false, last_seen: new Date().toISOString() });
    }
    setOnDuty(false);
    loadAll();
  };

  const userLoc = location ? [location.lat, location.lng] : null;
  const visibleVolunteers = isVolunteer ? volunteers.filter((v) => v.id !== myVolunteer?.id) : volunteers;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
              <Map className="w-4 h-4" /> Live safety network
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold">Safe Map</h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
              {isVolunteer
                ? 'Active SOS alerts near you appear here so you can respond. Regular traveler locations are never shown.'
                : 'Nearby guardians are visible to you — but your location stays hidden until you trigger SOS.'}
            </p>
          </div>
          {isVolunteer && (
            <Button
              onClick={onDuty ? goOffDuty : goOnDuty}
              className={onDuty ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
            >
              <Activity className="w-4 h-4" /> {onDuty ? 'Go off duty' : 'Go on duty'}
            </Button>
          )}
        </div>

        {/* Privacy banner */}
        <div className={cn(
          'mt-4 rounded-xl p-3 flex items-center gap-2.5 text-xs',
          isVolunteer ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-700'
        )}>
          {isVolunteer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {isVolunteer
            ? 'Volunteer view: you see active SOS alerts only. Traveler locations are private unless they SOS.'
            : 'Traveler view: you see on-duty guardians. They cannot see you until you trigger SOS.'}
        </div>

        {/* Map */}
        <div className="mt-5">
          <SafetyMap
            center={userLoc}
            userLocation={userLoc}
            volunteers={visibleVolunteers}
            activeSOS={sosAlerts}
            showVolunteers
            showSOS
            height="55vh"
          />
          <MapLegend />
        </div>

        {/* Summary cards */}
        <div className="grid sm:grid-cols-3 gap-3 mt-6">
          <SummaryCard icon={Shield} tint="text-primary" label="On-duty guardians" value={volunteers.length} />
          <SummaryCard icon={Siren} tint="text-destructive" label="Active SOS alerts" value={sosAlerts.length} />
          <SummaryCard icon={Locate} tint="text-accent" label="Your GPS" value={location ? 'Live' : 'Off'} />
        </div>

        {isVolunteer && sosAlerts.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold mb-3">Alerts needing response</p>
            <div className="space-y-2">
              {sosAlerts.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                  <Siren className="w-5 h-5 text-destructive" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">SOS active</p>
                    <p className="text-xs text-muted-foreground font-mono">{s.location_label}</p>
                  </div>
                  <a href={`https://maps.google.com/?q=${s.location_lat},${s.location_lng}`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline">Navigate</Button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function SummaryCard({ icon: Icon, tint, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
      <div className={cn('w-10 h-10 rounded-xl bg-secondary flex items-center justify-center', tint)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-heading font-bold text-xl">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}