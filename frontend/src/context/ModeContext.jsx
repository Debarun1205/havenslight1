import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  fetchVolunteerStatus,
  volunteerOptIn,
  volunteerOptOut,
  setVolunteerDuty,
} from "../api/endpoints";
import { useAuth } from "./AuthContext";

const ModeContext = createContext(null);

// "mode" is purely a client-side view switch — whether the dashboard shows
// the user-facing live map or the volunteer/guardian view. It's gated by
// the backend's isVolunteer flag (can't switch to Guardian mode without
// opting in first) but the switch itself isn't persisted server-side.
export function ModeProvider({ children }) {
  const { user } = useAuth();
  const [mode, setModeState] = useState(() => localStorage.getItem("havenslight_mode") || "user");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await fetchVolunteerStatus();
      setProfile(data.profile);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // If the profile hasn't loaded yet or isn't opted in, never let the UI be
  // stuck showing "volunteer mode" for an account that isn't one.
  useEffect(() => {
    if (!loading && profile && !profile.isVolunteer && mode === "volunteer") {
      setModeState("user");
    }
  }, [loading, profile, mode]);

  const setMode = (next) => {
    setModeState(next);
    localStorage.setItem("havenslight_mode", next);
  };

  const optIn = async () => {
    const { data } = await volunteerOptIn();
    setProfile(data.profile);
    return data.profile;
  };

  const optOut = async () => {
    const { data } = await volunteerOptOut();
    setProfile(data.profile);
    setMode("user");
    return data.profile;
  };

  const goOnDuty = async (longitude, latitude) => {
    const { data } = await setVolunteerDuty({ onDuty: true, longitude, latitude });
    setProfile(data.profile);
    return data.profile;
  };

  const goOffDuty = async () => {
    const { data } = await setVolunteerDuty({ onDuty: false });
    setProfile(data.profile);
    return data.profile;
  };

  return (
    <ModeContext.Provider
      value={{ mode, setMode, profile, loading, refresh, optIn, optOut, goOnDuty, goOffDuty }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used within ModeProvider");
  return ctx;
}
