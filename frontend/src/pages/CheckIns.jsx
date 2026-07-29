import React, { useEffect, useState } from "react";
import { fetchCheckIns, createCheckIn, confirmCheckIn } from "../api/endpoints";
import { useSocket } from "../context/SocketContext";
import PageHeader from "../components/ui/PageHeader";
import { Card, Field, Input, Badge, EmptyState, ErrorBanner } from "../components/ui/Primitives";
import Button from "../components/ui/Button";

const statusTone = {
  pending: "gold",
  confirmed: "teal",
  missed: "alert",
  escalated: "alert",
};

export default function CheckIns() {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { lastEvent } = useSocket();

  const load = async () => {
    const { data } = await fetchCheckIns();
    setCheckIns(data.checkIns);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (lastEvent) load();
  }, [lastEvent]);

  const handleConfirm = async (id) => {
    setError("");
    try {
      const { data } = await confirmCheckIn(id);
      setCheckIns((prev) => prev.map((c) => (c._id === id ? data.checkIn : c)));
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't confirm this check-in.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Stay accountable"
        title="Check-ins"
        subtitle="Schedule a time to confirm you're safe. If you miss it, your circle gets escalated automatically."
        action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Close" : "New check-in"}</Button>}
      />

      <ErrorBanner message={error} />

      {showForm && (
        <NewCheckInForm
          onCreated={(checkIn) => {
            setCheckIns((prev) => [checkIn, ...prev]);
            setShowForm(false);
          }}
          onError={setError}
        />
      )}

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-ink-soft">Loading...</p>
        ) : checkIns.length === 0 ? (
          <EmptyState
            title="No check-ins yet"
            description="Meeting someone new or heading somewhere unfamiliar? Schedule a check-in so your circle knows to worry if you go quiet."
            action={
              <Button onClick={() => setShowForm(true)} variant="subtle">
                Schedule your first check-in
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {checkIns.map((c) => (
              <Card key={c._id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-medium text-ink">{c.label || "Check-in"}</p>
                  <p className="font-mono text-xs text-ink-soft">
                    Due {new Date(c.dueAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={statusTone[c.status]}>{formatStatus(c.status)}</Badge>
                  {c.status === "pending" && (
                    <Button variant="subtle" onClick={() => handleConfirm(c._id)}>
                      I'm safe
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NewCheckInForm({ onCreated, onError }) {
  const [label, setLabel] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [includeLocation, setIncludeLocation] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    onError("");
    if (!dueAt) return;
    setSubmitting(true);
    try {
      let coords = {};
      if (includeLocation && navigator.geolocation) {
        try {
          const pos = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 })
          );
          coords = { longitude: pos.coords.longitude, latitude: pos.coords.latitude };
        } catch {
          // Location is optional here — proceed without it if denied/unavailable.
        }
      }
      const { data } = await createCheckIn({
        label,
        dueAt: new Date(dueAt).toISOString(),
        ...coords,
      });
      onCreated(data.checkIn);
      setLabel("");
      setDueAt("");
    } catch (err) {
      onError(err.response?.data?.message || "Couldn't schedule this check-in.");
    } finally {
      setSubmitting(false);
    }
  };

  const minDateTime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <Card className="p-5">
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <Field label="What's this check-in for? (optional)" htmlFor="label" className="sm:col-span-2">
          <Input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Meeting a stranger from a hostel group"
          />
        </Field>
        <Field label="Confirm safe by" htmlFor="dueAt">
          <Input
            id="dueAt"
            type="datetime-local"
            required
            min={minDateTime}
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
          />
        </Field>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={includeLocation}
              onChange={(e) => setIncludeLocation(e.target.checked)}
              className="h-4 w-4 rounded border-ink/30 text-teal focus-visible:outline-teal"
            />
            Attach my current location
          </label>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Scheduling..." : "Schedule check-in"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function formatStatus(status) {
  return { pending: "Pending", confirmed: "Confirmed safe", missed: "Missed", escalated: "Escalated" }[status];
}
