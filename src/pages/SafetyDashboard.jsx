import { useEffect, useState } from 'react';
import { Activity, Siren, Clock, ShieldCheck, Loader2, RefreshCw, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LEVEL_STYLE = {
  Low: { color: 'text-green-600 bg-green-50 border-green-200', bar: 'bg-green-500', icon: CheckCircle2 },
  Medium: { color: 'text-amber-600 bg-amber-50 border-amber-200', bar: 'bg-amber-500', icon: AlertTriangle },
  High: { color: 'text-red-600 bg-red-50 border-red-200', bar: 'bg-red-500', icon: AlertTriangle },
};

function timeAgo(d) {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function SafetyDashboard() {
  const { user } = useAuth();
  const { location, request } = useGeolocation();
  const [activeSos, setActiveSos] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);
  const [assessment, setAssessment] = useState(null);

  const load = async () => {
    if (!user) return;
    try {
      const [sos, ci] = await Promise.all([
        base44.entities.SOSAlert.list('-created_date', 20),
        base44.entities.CheckIn.list('-created_date', 10),
      ]);
      setActiveSos(sos.filter((s) => s.created_by_id === user.id && s.status === 'active'));
      setCheckins(ci.filter((c) => c.created_by_id === user.id));
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); request().catch(() => {}); }, [user]);

  const assess = async () => {
    if (!location) return;
    setAssessing(true);
    setAssessment(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        model: 'gemini_3_flash',
        add_context_from_internet: true,
        prompt: `Assess the current safety/security situation for a traveler at GPS coordinates latitude ${location.lat}, longitude ${location.lng}. Identify the city/country if possible. Return a security level (Low, Medium, or High), a concise summary of the current situation, and 3 practical safety tips for a traveler there right now.`,
        response_json_schema: {
          type: 'object',
          properties: {
            level: { type: 'string', enum: ['Low', 'Medium', 'High'] },
            place: { type: 'string' },
            summary: { type: 'string' },
            tips: { type: 'array', items: { type: 'string' } }
          },
          required: ['level', 'summary', 'tips']
        }
      });
      setAssessment(res);
    } catch (e) {
      setAssessment({ level: 'Medium', place: 'Unknown', summary: 'Could not assess live safety data.', tips: ['Stay aware of your surroundings.', 'Keep your Guardian Circle updated.', 'Avoid unfamiliar areas at night.'] });
    }
    setAssessing(false);
  };

  useEffect(() => { if (location) assess(); }, [location?.lat, location?.lng]);

  const latestCheckin = checkins[0];
  const level = assessment?.level || 'Low';
  const L = LEVEL_STYLE[level];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
          <Activity className="w-4 h-4" /> Your safety at a glance
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">Safety Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Active alerts, check-in status, and a live security read of where you are now.</p>

        <div className="grid lg:grid-cols-3 gap-4 mt-6">
          {/* Security level — spans 2 cols */}
          <div className={cn('lg:col-span-2 rounded-2xl border-2 p-5', L.color)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <L.icon className="w-5 h-5" />
                <span className="font-semibold">Location security level</span>
              </div>
              <Button variant="ghost" size="sm" onClick={assess} disabled={assessing || !location}>
                {assessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Refresh
              </Button>
            </div>

            {!location ? (
              <p className="text-sm mt-4">Enable location access to assess your current area's security.</p>
            ) : assessing ? (
              <div className="flex items-center gap-2 mt-4 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing live safety data for your location…</div>
            ) : assessment ? (
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className={cn('text-3xl font-heading font-bold', L.color.split(' ')[0])}>{assessment.level}</span>
                  {assessment.place && <span className="text-sm text-muted-foreground">· {assessment.place}</span>}
                </div>
                <p className="text-sm mt-2 leading-relaxed">{assessment.summary}</p>
                <div className="h-2 rounded-full bg-black/5 mt-4 overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', L.bar)} style={{ width: level === 'High' ? '90%' : level === 'Medium' ? '55%' : '20%' }} />
                </div>
                {assessment.tips?.length > 0 && (
                  <ul className="mt-4 space-y-1.5">
                    {assessment.tips.map((t, i) => (
                      <li key={i} className="text-sm flex gap-2"><span className="text-current">•</span> {t}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
            {location && (
              <p className="text-xs mt-4 flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3 h-3" /> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
          </div>

          {/* Active SOS */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-destructive">
              <Siren className="w-5 h-5" />
              <span className="font-semibold">Active SOS</span>
            </div>
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : activeSos.length === 0 ? (
              <div className="mt-4 text-center">
                <ShieldCheck className="w-8 h-8 text-green-500 mx-auto" />
                <p className="text-sm font-medium mt-2">No active alerts</p>
                <p className="text-xs text-muted-foreground mt-1">You're clear.</p>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {activeSos.slice(0, 3).map((s) => (
                  <div key={s.id} className="rounded-xl bg-destructive/5 border border-destructive/20 p-3">
                    <p className="text-sm font-medium text-destructive">SOS active</p>
                    <p className="text-xs text-muted-foreground">{s.location_label || 'Location shared'} · {timeAgo(s.triggered_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent check-in */}
          <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-semibold">Recent check-in status</span>
            </div>
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : !latestCheckin ? (
              <p className="text-sm text-muted-foreground mt-4">No check-ins yet. Set one from the Check-ins page to stay accountable.</p>
            ) : (
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={cn('inline-block text-sm font-medium px-2 py-0.5 rounded-full mt-1',
                    latestCheckin.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    latestCheckin.status === 'escalated' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>
                    {latestCheckin.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Confirm by</p>
                  <p className="text-sm font-medium mt-1">{new Date(latestCheckin.confirm_by).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Activity</p>
                  <p className="text-sm mt-1 truncate">{latestCheckin.activity_note || '—'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}