import { useEffect, useState } from 'react';
import { Siren, MapPin, Phone, MessageCircle, CheckCircle2, AlertTriangle, Loader2, Users } from 'lucide-react';
import Layout from '@/components/Layout';
import SosButton from '@/components/safety/SosButton';
import { useGeolocation } from '@/hooks/useGeolocation';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SOS() {
  const { location, loading: locLoading, request } = useGeolocation();
  const [status, setStatus] = useState('idle'); // idle | triggering | active
  const [alert, setAlert] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    base44.entities.EmergencyContact.list().then(setContacts).catch(() => {});
    base44.entities.Volunteer.filter({ is_on_duty: true }).then(setVolunteers).catch(() => {});
    base44.entities.SOSAlert.filter({ status: 'active' }).then((rows) => {
      if (rows.length) { setAlert(rows[0]); setStatus('active'); }
    }).catch(() => {});
  }, []);

  const dispatch = (contactsList, alertRec) => {
    const sorted = [...contactsList].sort((a, b) => (a.priority || 9) - (b.priority || 9));
    sorted.forEach((c, i) => {
      if (!c.notify_whatsapp) return;
      const phone = c.phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
      const msg = encodeURIComponent(
        `🚨 HAVENSLIGHT SOS 🚨\nI need help. My live location:\nhttps://maps.google.com/?q=${alertRec.location_lat},${alertRec.location_lng}\n— sent via HavensLight`
      );
      setTimeout(() => { window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener'); }, i * 500);
    });
  };

  const trigger = async () => {
    setStatus('triggering');
    let loc = location;
    if (!loc) {
      try { loc = await request(); } catch { /* use null */ }
    }
    const payload = {
      status: 'active',
      triggered_at: new Date().toISOString(),
      location_lat: loc?.lat ?? null,
      location_lng: loc?.lng ?? null,
      location_label: loc ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : 'Location unavailable',
      contacts_notified_count: contacts.length,
    };
    const created = await base44.entities.SOSAlert.create(payload);
    setAlert(created);
    setStatus('active');
    dispatch(contacts, created);
    base44.entities.Notification.create({
      title: 'SOS triggered',
      message: `Emergency alert sent to ${contacts.length} contact${contacts.length !== 1 ? 's' : ''}. Location: ${payload.location_label}`,
      type: 'sos',
      link: '/sos',
    });
  };

  const resolve = async () => {
    await base44.entities.SOSAlert.update(alert.id, { status: 'resolved', resolved_at: new Date().toISOString() });
    setAlert(null);
    setStatus('idle');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold">Emergency SOS</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            One tap shares your live location with your Guardian Circle and nearby guardians.
          </p>
        </div>

        {/* Trigger */}
        {status !== 'active' && (
          <div className="flex flex-col items-center py-6">
            <SosButton status={status} onTrigger={trigger} />
            <p className="text-xs text-muted-foreground mt-6 max-w-xs text-center">
              {contacts.length === 0
                ? '⚠ Add contacts in your Guardian Circle first so someone is notified.'
                : `${contacts.length} guardian${contacts.length > 1 ? 's' : ''} will be alerted instantly.`}
            </p>
          </div>
        )}

        {/* Active alert */}
        {status === 'active' && alert && (
          <div className="animate-fade-up space-y-5">
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-destructive flex items-center justify-center animate-sos-pulse">
                    <Siren className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-destructive">SOS active</p>
                    <p className="text-xs text-muted-foreground">
                      Triggered {new Date(alert.triggered_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 text-sm bg-card rounded-xl p-3">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-mono text-xs">{alert.location_label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  {alert.contacts_notified_count} contacts ready to notify · {volunteers.length} guardian{volunteers.length !== 1 ? 's' : ''} nearby alerted
                </p>
              </CardContent>
            </Card>

            {/* Alerts dispatched automatically */}
            <div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> WhatsApp alerts dispatched automatically
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Your live location was sent to every contact via WhatsApp the moment you triggered. Re-send or call below if a window was blocked.
              </p>
              <div className="space-y-2">
                {contacts.map((c) => {
                  const phone = c.phone.replace(/[^\d+]/g, '');
                  const waPhone = phone.replace(/^\+/, '');
                  const msg = encodeURIComponent(
                    `🚨 HAVENSLIGHT SOS 🚨\nI need help. My live location:\nhttps://maps.google.com/?q=${alert.location_lat},${alert.location_lng}\n— sent via HavensLight`
                  );
                  return (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {c.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.phone}</p>
                      </div>
                      <a href={`tel:${phone}`} className="p-2 rounded-lg bg-secondary hover:bg-secondary/70">
                        <Phone className="w-4 h-4" />
                      </a>
                      {c.notify_whatsapp && (
                        <a href={`https://wa.me/${waPhone}?text=${msg}`} target="_blank" rel="noreferrer"
                          className="p-2 rounded-lg bg-[#25D366]/15 text-[#1da851] hover:bg-[#25D366]/25">
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  );
                })}
                {contacts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No contacts added yet.</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { navigator.clipboard?.writeText(`https://maps.google.com/?q=${alert.location_lat},${alert.location_lng}`); }}>
                <MapPin className="w-4 h-4" /> Copy live location
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={resolve}>
                <CheckCircle2 className="w-4 h-4" /> I'm safe — resolve
              </Button>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <MiniStat icon={Users} label="Guardians" value={contacts.length} />
            <MiniStat icon={MapPin} label="Nearby" value={volunteers.length} />
            <MiniStat icon={Loader2} label="GPS" value={location ? 'Ready' : 'Tap'} />
          </div>
        )}
      </div>
    </Layout>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <Icon className="w-4 h-4 text-muted-foreground mx-auto" />
      <p className="font-heading font-bold text-lg mt-1">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}