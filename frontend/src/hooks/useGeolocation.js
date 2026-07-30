import { useEffect, useRef, useState } from "react";

/**
 * Wraps the browser Geolocation API. With watch=true it keeps position
 * fresh via watchPosition (used while a volunteer is on duty); with
 * watch=false it just grabs a single fix (used for the user-mode map,
 * which doesn't need continuous tracking of the user themselves).
 */
export function useGeolocation({ watch = false } = {}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation isn't available in this browser.");
      setLoading(false);
      return;
    }

    const onSuccess = (pos) => {
      setPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setLoading(false);
      setError(null);
    };
    const onError = (err) => {
      setError(err.message || "Couldn't get your location.");
      setLoading(false);
    };

    if (watch) {
      watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        maximumAge: 15000,
      });
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [watch]);

  return { position, error, loading };
}
