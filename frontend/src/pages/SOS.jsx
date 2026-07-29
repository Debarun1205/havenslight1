import React, { useEffect, useState, useCallback, useRef } from "react";
import { fetchAlerts, triggerSOS, updateSOSLocation, resolveSOS } from "../api/endpoints";
import { useSocket } from "../context/SocketContext";
import PageHeader from "../components/ui/PageHeader";
import { Card, Badge, ErrorBanner } from "../components/ui/Primitives";
import Button from "../components/ui/Button";
import SignalRing from "../components/ui/SignalRing";

export default function SOS() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [triggering, setTriggering] = useState(false);
  const [geoStatus, setGeoStatus] = useState("idle"); // idle | locating | ready | denied
  const watchIdRef = useRef(null);
  const { lastEvent } = useSocket();

  const load = useCallback(async () => {
    const { data } = await fetchAlerts();
    setAlerts(data.alerts);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh whenever the socket tells us something changed for this user.
  useEffect(() => {
    if (lastEvent) load();
  }, [lastEvent, load]);

  useEffect(() => () => stopWatching(), []);

  const activeAlert = alerts.find((a) => a.status === "active");

  const stopWatching = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const getPosition = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation isn't available in this browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    });

  const handleTrigger = async () => {
    setError("");
    setTriggering(true);
    setGeoStatus("locating");
    try {
      const pos = await getPosition();
      setGeoStatus("ready");
      const { data } = await triggerSOS({
        longitude: pos.coords.longitude,
        latitude: pos.coords.latitude,
      });
      setAlerts((prev) => [data.alert, ...prev]);
      startWatchingLocation(data.alert._id);
    } catch (err) {
      setGeoStatus("denied");
      setError(
        err.response?.data?.message ||
          err.message ||
          "Couldn't trigger SOS. Check location permissions and try again."
      );
    } finally {
      setTriggering(false);
    }
  };

  const startWatchingLocation = (alertId) => {
    if (!navigator.geolocation) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        try {
          await updateSOSLocation(alertId, {
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
          });
        } catch {
          // Non-fatal — location updates are best-effort while the alert is active.
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 15000 }
    );
  };

  const handleResolve = async (falseAlarm) => {
    if (!activeAlert) return;
    setError("");
    try {
      const { data } = await resolveSOS(activeAlert._id, { falseAlarm });
      setAlerts((prev) => prev.map((a) => (a._id === data.alert._id ? data.alert : a)));
      stopWatching();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update the alert.");
    }
  };

  const history = alerts.filter((a) => a.status !== "active");

  return (
    <div>
      <PageHeader
        eyebrow="Emergency"
        title="SOS"
        subtitle="One tap shares your live location with everyone in your guardian circle."
      />

      <ErrorBanner message={error} />

      <Card className="mt-4 flex flex-col items-center gap-6 p-10 text-center">
        <SignalRing active={!!activeAlert} tone="alert" />

        {activeAlert ? (
          <div>
            <Badge tone="alert">Alert active</Badge>
            <h2 className="mt-3 font-display text-xl text-ink">Help is on the way to your circle</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Triggered {new Date(activeAlert.createdAt).toLocaleTimeString()} ·{" "}
              {activeAlert.notifiedContacts.length} contact(s) notified
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="ghost" onClick={() => handleResolve(true)}>
                Mark as false alarm
              </Button>
              <Button variant="primary" onClick={() => handleResolve(false)}>
                I'm safe — resolve
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="font-display text-xl text-ink">Press to alert your guardian circle</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
              We'll share your live location with your emergency contacts until you mark yourself safe.
            </p>
            <Button
              variant="alert"
              className="mt-6 px-8 py-3.5 text-base"
              onClick={handleTrigger}
              disabled={triggering}
            >
              {triggering ? "Getting your location..." : "Trigger SOS"}
            </Button>
            {geoStatus === "denied" && (
              <p className="mt-3 text-xs text-alert-deep">
                Location access is needed to trigger SOS. Check your browser's site permissions.
              </p>
            )}
          </div>
        )}
      </Card>

      <div className="mt-10">
        <h2 className="font-display text-lg text-ink">Alert history</h2>
        {loading ? (
          <p className="mt-3 text-sm text-ink-soft">Loading...</p>
        ) : history.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">No past alerts — nothing to see here yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {history.map((a) => (
              <Card key={a._id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {new Date(a.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {a.notifiedContacts.length} contact(s) notified
                    {a.notes ? ` · ${a.notes}` : ""}
                  </p>
                </div>
                <Badge tone={a.status === "false_alarm" ? "gold" : "teal"}>
                  {a.status === "false_alarm" ? "False alarm" : "Resolved"}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
