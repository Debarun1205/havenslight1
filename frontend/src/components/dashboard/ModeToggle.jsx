import React from "react";
import { useMode } from "../../context/ModeContext";

export default function ModeToggle() {
  const { mode, setMode, profile } = useMode();

  return (
    <div className="inline-flex rounded-full border border-ink/10 bg-white p-1 shadow-card">
      <button
        onClick={() => setMode("user")}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
          mode === "user" ? "bg-teal text-white" : "text-ink-soft hover:text-ink"
        }`}
      >
        User mode
      </button>
      <button
        onClick={() => setMode("volunteer")}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
          mode === "volunteer" ? "bg-navy text-white" : "text-ink-soft hover:text-ink"
        }`}
      >
        Guardian mode
        {profile?.onDuty && (
          <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-teal align-middle" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
