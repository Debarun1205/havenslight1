import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAlerts, fetchCheckIns, fetchContacts } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/ui/PageHeader";
import { Card, Badge } from "../components/ui/Primitives";
import Button from "../components/ui/Button";
import SignalRing from "../components/ui/SignalRing";

export default function Dashboard() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [a, c, k] = await Promise.all([fetchAlerts(), fetchCheckIns(), fetchContacts()]);
        if (cancelled) return;
        setAlerts(a.data.alerts);
        setCheckIns(c.data.checkIns);
        setContacts(k.data.contacts);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeAlert = alerts.find((a) => a.status === "active");
  const pendingCheckIns = checkIns.filter((c) => c.status === "pending");
  const nextCheckIn = [...pendingCheckIns].sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))[0];

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title={`Namaste, ${user?.name?.split(" ")[0] || "traveler"}`}
        subtitle="Here's where things stand with your safety network right now."
      />

      {activeAlert && (
        <Card className="mb-6 flex flex-col items-center gap-4 border-alert/30 bg-alert-soft/60 p-6 text-center sm:flex-row sm:text-left">
          <SignalRing active size={96} tone="alert" />
          <div className="flex-1">
            <Badge tone="alert">SOS active</Badge>
            <h3 className="mt-2 font-display text-lg text-ink">Your alert is live</h3>
            <p className="text-sm text-ink-soft">
              {activeAlert.notifiedContacts.length} contact(s) were notified when this was triggered.
            </p>
          </div>
          <Button as={Link} to="/sos" variant="alert">
            Manage alert
          </Button>
        </Card>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          label="Emergency contacts"
          value={loading ? "—" : contacts.length}
          hint={contacts.length === 0 ? "Add at least one to enable SOS" : "Ready for SOS"}
          to="/contacts"
          tone={contacts.length === 0 ? "gold" : "teal"}
        />
        <StatCard
          label="Pending check-ins"
          value={loading ? "—" : pendingCheckIns.length}
          hint={nextCheckIn ? `Next due ${formatDue(nextCheckIn.dueAt)}` : "Nothing scheduled"}
          to="/checkins"
          tone="teal"
        />
        <StatCard
          label="SOS status"
          value={activeAlert ? "Active" : "Clear"}
          hint={activeAlert ? "Resolve when you're safe" : "No alerts in progress"}
          to="/sos"
          tone={activeAlert ? "alert" : "teal"}
        />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg text-ink">Upcoming check-ins</h2>
          {pendingCheckIns.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">
              No check-ins scheduled. Set one before heading somewhere unfamiliar.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pendingCheckIns.slice(0, 4).map((c) => (
                <li key={c._id} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{c.label || "Check-in"}</span>
                  <span className="font-mono text-xs text-ink-soft">{formatDue(c.dueAt)}</span>
                </li>
              ))}
            </ul>
          )}
          <Button as={Link} to="/checkins" variant="subtle" className="mt-5">
            Manage check-ins
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg text-ink">Your guardian circle</h2>
          {contacts.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">
              You haven't added anyone yet — SOS needs at least one contact to trigger.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {contacts.slice(0, 4).map((c) => (
                <li key={c._id} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{c.name}</span>
                  <span className="text-xs text-ink-soft">{c.relationship || "Contact"}</span>
                </li>
              ))}
            </ul>
          )}
          <Button as={Link} to="/contacts" variant="subtle" className="mt-5">
            Manage contacts
          </Button>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint, to, tone }) {
  const toneClass = tone === "alert" ? "text-alert-deep" : tone === "gold" ? "text-[#8a5c14]" : "text-teal-deep";
  return (
    <Link to={to}>
      <Card className="h-full p-5 transition-transform hover:-translate-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
        <p className={`mt-2 font-display text-3xl font-semibold ${toneClass}`}>{value}</p>
        <p className="mt-1 text-xs text-ink-soft">{hint}</p>
      </Card>
    </Link>
  );
}

function formatDue(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
