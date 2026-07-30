import React, { useEffect, useState, useCallback } from "react";
import { fetchNearbyEmergencyServices } from "../api/endpoints";
import { useGeolocation } from "../hooks/useGeolocation";
import PageHeader from "../components/ui/PageHeader";
import { Card, Badge, ErrorBanner } from "../components/ui/Primitives";
import LiveMap from "../components/map/LiveMap";

const CATEGORIES = [
  { id: "police", label: "Police", color: "#12324A" },
  { id: "hospital", label: "Hospital", color: "#D64550" },
  { id: "clinic", label: "Clinic", color: "#1F8A82" },
  { id: "pharmacy", label: "Pharmacy", color: "#E3A23C" },
];

export default function EmergencyMap() {
  const { position, error: geoError, loading: geoLoading } = useGeolocation();
  const [activeCategories, setActiveCategories] = useState(CATEGORIES.map((c) => c.id));
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!position) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await fetchNearbyEmergencyServices({
        longitude: position.longitude,
        latitude: position.latitude,
        radius: 5000,
        category: activeCategories.join(","),
      });
      setServices(data.services);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load nearby emergency services.");
    } finally {
      setLoading(false);
    }
  }, [position, activeCategories]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleCategory = (id) => {
    setActiveCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  return (
    <div>
      <PageHeader
        eyebrow="Around you"
        title="Emergency services"
        subtitle="Police stations, hospitals, clinics, and pharmacies nearby — filter by what you need."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const active = activeCategories.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggleCategory(c.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active ? "border-transparent text-white" : "border-ink/15 bg-white text-ink-soft"
              }`}
              style={active ? { backgroundColor: c.color } : undefined}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: active ? "white" : c.color }}
              />
              {c.label}
            </button>
          );
        })}
      </div>

      <ErrorBanner message={error} />

      {geoLoading ? (
        <Card className="p-6">
          <p className="text-sm text-ink-soft">Finding your location...</p>
        </Card>
      ) : geoError || !position ? (
        <Card className="p-6">
          <p className="text-sm text-alert-deep">
            {geoError || "Location unavailable"} — allow location access to see what's nearby.
          </p>
        </Card>
      ) : (
        <>
          <Card className="p-5">
            <LiveMap
              center={{ lat: position.latitude, lng: position.longitude }}
              zoom={13}
              height={420}
              markers={[
                { id: "me", lat: position.latitude, lng: position.longitude, color: "#0B1E2D", label: "You", size: 18 },
                ...services.map((s) => ({
                  id: s.id,
                  lat: s.latitude,
                  lng: s.longitude,
                  color: CATEGORIES.find((c) => c.id === s.category)?.color || "#4E6773",
                  label: s.name,
                  popup: [s.phone, s.address].filter(Boolean).join(" · ") || undefined,
                })),
              ]}
            />
          </Card>

          <div className="mt-6">
            {loading ? (
              <p className="text-sm text-ink-soft">Searching nearby...</p>
            ) : services.length === 0 ? (
              <p className="text-sm text-ink-soft">Nothing found in the selected categories nearby.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((s) => {
                  const cat = CATEGORIES.find((c) => c.id === s.category);
                  return (
                    <Card key={s.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-ink">{s.name}</p>
                        {cat && (
                          <Badge tone={s.category === "hospital" ? "alert" : s.category === "police" ? "navy" : "teal"}>
                            {cat.label}
                          </Badge>
                        )}
                      </div>
                      {s.address && <p className="mt-1 text-xs text-ink-soft">{s.address}</p>}
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="font-mono text-ink-soft">{s.phone || "No phone listed"}</span>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-teal-deep hover:underline"
                        >
                          Directions
                        </a>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
