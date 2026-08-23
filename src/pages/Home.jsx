import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Siren, Users, Clock, Map, Shield, ArrowRight, Sparkles, Activity } from 'lucide-react';
import Layout from '@/components/Layout';
import { useMode } from '@/components/ModeContext';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { mode, onDuty, setOnDuty } = useMode();
  const [contacts, setContacts] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [activeSOS, setActiveSOS] = useState([]);
  const isVolunteer = mode === 'volunteer';

  useEffect(() => {
    base44.entities.EmergencyContact.list().then(setContacts).catch(() => {});
    base44.entities.Volunteer.filter({ is_on_duty: true }).then(setVolunteers).catch(() => {});
    base44.entities.SOSAlert.filter({ status: 'active' }).then(setActiveSOS).catch(() => {});
  }, []);

  const onDutyVolunteers = volunteers.filter((v) => v.is_on_duty);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-[#0c4a6e] text-white p-7 sm:p-10 shadow-soft">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute right-16 bottom-0 w-32 h-32 rounded-full bg-accent/10 blur-2xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/15 px-3 py-1 rounded-full backdrop-blur">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> {isVolunteer ? 'Guardian mode' : 'Traveler mode'}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold mt-4 text-balance">
              {isVolunteer ? 'Someone nearby may need you.' : 'A haven, wherever the road takes you.'}
            </h1>
            <p className="text-white/70 mt-3 max-w-md text-sm sm:text-base">
              {isVolunteer
                ? 'Go on duty to be alerted to travelers in danger near you. Your location is shared only while active.'
                : 'One tap sends your live location to your Guardian Circle and nearby guardians — instantly.'}
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {isVolunteer ? (
                <Button
                  size="lg"
                  onClick={() => setOnDuty(!onDuty)}
                  className={onDuty ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-accent hover:bg-accent/90 text-accent-foreground'}
                >
                  <Activity className="w-4.5 h-4.5" /> {onDuty ? 'Go off duty' : 'Go on duty'}
                </Button>
              ) : (
                <Link to="/sos">
                  <Button size="lg" className="bg-destructive hover:bg-destructive/90 text-white animate-sos-pulse">
                    <Siren className="w-4.5 h-4.5" /> Hold to SOS
                  </Button>
                </Link>
              )}
              <Link to="/safe-map">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Map className="w-4.5 h-4.5" /> Open safe map
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <StatCard icon={Users} label="Guardians" value={contacts.length} sub="in your circle" to="/guardian-circle" tint="text-primary" />
          <StatCard icon={Shield} label="On duty nearby" value={onDutyVolunteers.length} sub="guardians active" to="/safe-map" tint="text-green-600" />
          <StatCard icon={Activity} label="Active SOS" value={activeSOS.length} sub="alerts now" to="/sos" tint="text-destructive" />
          <StatCard icon={Clock} label="Check-ins" value="—" sub="manage schedule" to="/check-ins" tint="text-accent" />
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <ActionCard to="/guardian-circle" icon={Users} title="Guardian Circle" desc="Trusted contacts notified the instant you trigger SOS." />
          <ActionCard to="/check-ins" icon={Clock} title="Scheduled Check-ins" desc="Set a safe-by time. Miss it and we escalate automatically." />
          <ActionCard to="/safe-map" icon={Map} title="Safe Map" desc={isVolunteer ? 'See active SOS alerts near you to respond.' : 'See nearby guardians. Your location stays private unless you SOS.'} />
        </div>

        {/* Trust note */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold">Asymmetric privacy by design</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Nearby guardians are always visible to you. But your location is <strong>never</strong> visible to them — until you trigger SOS. Then it lights up so they can find and help you fast.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon: Icon, label, value, sub, to, tint }) {
  return (
    <Link to={to}>
      <Card className="hover:shadow-glow transition-all h-full">
        <CardContent className="p-4">
          <Icon className={`w-5 h-5 ${tint}`} />
          <p className="text-2xl font-heading font-bold mt-2">{value}</p>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground/70">{sub}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function ActionCard({ to, icon: Icon, title, desc }) {
  return (
    <Link to={to}>
      <Card className="group hover:shadow-glow transition-all h-full overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="font-semibold mt-3">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">{desc}</p>
        </CardContent>
      </Card>
    </Link>
  );
}