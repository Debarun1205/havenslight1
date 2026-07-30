import React, { useEffect, useState, useCallback } from "react";
import { fetchNearbyVolunteers } from "../../api/endpoints";
import { useGeolocation } from "../../hooks/useGeolocation";
import { useSocket } from "../../context/SocketContext";
import { Card, Badge } from "../ui/Primitives";
import LiveMap from "../map/LiveMap";

export default function GuardianMap() {
  const { position, error: geoError, loading: geoLoading } = useGeolocation();
  const { socket } = useSocket();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!position) return;
    try {
      const { data } = await fetchNearbyVolunteers({
        longitude: position.longitude,
        latitude: position.latitude,
      });
      setVolunteers(data.volunteers);
    } finally {
      setLoading(false);
    }
  }, [position]);

  useEffect(() => {
    load();
    // Poll as a fallback in case a socket event is missed — live updates
    // below make this feel instant most of the time regardless.
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, [load]);

  // Live updates: a volunteer going on/off duty or moving reflects on the
  // map immediately rather than waiting for the next poll.
  useEffect(() => {
    if (!socket) return;
    const onUpdate = (payload) => {
      setVolunteers((prev) => {
        const others = prev.filter((v) => v.volunteerId !== payload.volunteerId);
        return [
          ...others,
          {
            volunteerId: payload.volunteerId,
            name: payload.name,
            location: payload.location,
            updatedAt: payload.updatedAt,
          },
        ];
      });
    };
    const onOffline = (payload) => {
      setVolunteers((prev) => prev.filter((v) => v.volunteerId !== payload.volunteerId));
    };
    socket.on("volunteer:location_update", onUpdate);
    socket.on("volunteer:offline", onOffline);
    return () => {
      socket.off("volunteer:location_update", onUpdate);
      socket.off("volunteer:offline", onOffline);
    };
  }, [socket]);

  if (geoLoading || (loading && !geoError)) {
    return (
      <Card className="p-6">
        <p className="text-sm text-ink-soft">Finding your location...</p>
      </Card>
    );
  }

  if (geoError || !position) {
    return (
      <Card className="p-6">
        <h2 className="font-display text-lg text-ink">Nearby guardians</h2>
        <p className="mt-2 text-sm text-alert-deep">
          {geoError || "Location unavailable"} — allow location access to see guardians near you.
        </p>
      </Card>
    );
  }

  const markers = [
    {
      id: "me",
      lat: position.latitude,
      lng: position.longitude,
      color: "#0B1E2D",
      label: "You",
      size: 18,
    },
    ...volunteers.map((v) => ({
      id: v.volunteerId,
      lat: v.location.coordinates[1],
      lng: v.location.coordinates[0],
      color: "#1F8A82",
      label: v.name,
      popup: v.verified ? "Verified guardian" : "On duty nearby",
    })),
  ];

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg text-ink">Nearby guardians</h2>
          <p className="text-sm text-ink-soft">On-duty volunteers within 3km — your location stays private to them.</p>
        </div>
        <Badge tone={volunteers.length > 0 ? "teal" : "navy"}>
          {volunteers.length} nearby
        </Badge>
      </div>
      <LiveMap
        center={{ lat: position.latitude, lng: position.longitude }}
        markers={markers}
        radiusMeters={3000}
      />
    </Card>
  );
}
