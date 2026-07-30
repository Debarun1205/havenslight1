import React, { useEffect, useState, useRef } from "react";
import { useMode } from "../../context/ModeContext";
import { useGeolocation } from "../../hooks/useGeolocation";
import { useSocket } from "../../context/SocketContext";
import { fetchNearbySOSAlerts, updateVolunteerLocation } from "../../api/endpoints";
import { Card, Badge, ErrorBanner } from "../ui/Primitives";
import Button from "../ui/Button";
import LiveMap from "../map/LiveMap";

export default function VolunteerPanel() {
  const { profile, optIn, goOnDuty, goOffDuty } = useMode();
  const { socket } = useSocket();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const lastSentRef = useRef(0);

  const onDuty = !!profile?.onDuty;
  const { position, error: geoError } = useGeolocation({ watch: onDuty });

  // Push location updates to the backend while on duty — throttled so a
  // jittery GPS fix doesn't fire a request every second.
  useEffect(() => {
    if (!onDuty || !position) return;
    const now = Date.now();
    if (now - lastSentRef.current < 10000) return;
    lastSentRef.current = now;
    updateVolunteerLocation({ longitude: position.longitude, latitude: position.latitude }).catch(() => {});
  }, [onDuty, position]);

  useEffect(() => {
    if (!onDuty) {
      setAlerts([]);
      return;
    }
    fetchNearbySOSAlerts().then(({ data }) => setAlerts(data.alerts));
  }, [onDuty]);

  useEffect(() => {
    if (!socket) return;
    const onNearby = (payload) => {
      setAlerts((prev) => [
        { alertId: payload.alertId, requester: payload.requester, location: payload.location, distanceMeters: payload.distanceMeters, createdAt: payload.createdAt },
        ...prev.filter((a) => a.alertId !== payload.alertId),
      ]);
    };
    const onLocationUpdate = (payload) => {
      setAlerts((prev) =>
        prev.map((a) => (a.alertId === payload.alertId ? { ...a, location: payload.location } : a))
      );
    };
    const onResolved = (payload) => {
      setAlerts((prev) => prev.filter((a) => a.alertId !== payload.alertId));
    };
    socket.on("sos:nearby_alert", onNearby);
    socket.on("sos:location_update", onLocationUpdate);
    socket.on("sos:resolved", onResolved);
    return () => {
      socket.off("sos:nearby_alert", onNearby);
      socket.off("sos:location_update", onLocationUpdate);
      socket.off("sos:resolved", onResolved);
    };
  }, [socket]);

  const handleOptIn = async () => {
    setError("");
    setBusy(true);
    try {
      await optIn();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't opt in right now.");
    } finally {
      setBusy(false);
    }
  };

  const handleToggleDuty = async () => {
    setError("");
    setBusy(true);
    try {
      if (onDuty) {
        await goOffDuty();
      } else {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
        );
        await goOnDuty(pos.coords.longitude, pos.coords.latitude);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Couldn't update duty status.");
    } finally {
      setBusy(false);
    }
  };

  if (!profile?.isVolunteer) {
    return (
      <Card className="p-6 text-center">
        <h2 className="font-display text-lg text-ink">Become a guardian</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
          Opt in to the guardian network to be notified when someone nearby triggers SOS, so you
          can help. You're only located while deliberately on duty — never in the background.
        </p>
        <ErrorBanner message={error} />
        <Button className="mt-4" onClick={handleOptIn} disabled={busy}>
          {busy ? "Opting in..." : "Opt in as a guardian"}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg text-ink">Guardian duty</h2>
          <p className="text-sm text-ink-soft">
            {onDuty
              ? "You're on duty — nearby SOS alerts will reach you."
              : "You're off duty — go on duty to start receiving nearby SOS alerts."}
          </p>
        </div>
        <Button variant={onDuty ? "alert" : "primary"} onClick={handleToggleDuty} disabled={busy}>
          {busy ? "Updating..." : onDuty ? "Go off duty" : "Go on duty"}
        </Button>
      </div>

      <ErrorBanner message={error || (onDuty ? geoError : "")} />

      {onDuty && position && (
        <>
          <LiveMap
            center={{ lat: position.latitude, lng: position.longitude }}
            markers={[
              { id: "me", lat: position.latitude, lng: position.longitude, color: "#0B1E2D", label: "You", size: 18 },
              ...alerts.map((a) => ({
                id: a.alertId,
                lat: a.location.coordinates[1],
                lng: a.location.coordinates[0],
                color: "#D64550",
                pulse: true,
                size: 18,
                label: a.requester.name,
                popup: "Needs help",
              })),
            ]}
          />

          <div className="mt-4 space-y-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-ink-soft">No active alerts near you right now.</p>
            ) : (
              alerts.map((a) => (
                <div
                  key={a.alertId}
                  className="flex items-center justify-between rounded-xl border border-alert/30 bg-alert-soft/50 p-4"
                >
                  <div>
                    <Badge tone="alert">SOS</Badge>
                    <p className="mt-1 text-sm font-medium text-ink">{a.requester.name}</p>
                    <p className="text-xs text-ink-soft">
                      {a.distanceMeters ? `${(a.distanceMeters / 1000).toFixed(1)} km away` : ""}
                      {a.requester.phone ? ` · ${a.requester.phone}` : ""}
                    </p>
                  </div>
                  <Button
                    as="a"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${a.location.coordinates[1]},${a.location.coordinates[0]}`}
                    target="_blank"
                    rel="noreferrer"
                    variant="alert"
                    className="px-3 py-2 text-xs"
                  >
                    Get directions
                  </Button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </Card>
  );
}
