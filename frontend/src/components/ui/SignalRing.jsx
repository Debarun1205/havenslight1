import React from "react";

/**
 * The app's signature motif: concentric rings radiating outward, standing in
 * for an alert reaching a traveler's guardian circle. Active (red) on the
 * SOS trigger; a quiet static variant appears on check-in/doctor cards to
 * tie the visual language together without repeating the animation.
 */
export default function SignalRing({ active = false, size = 220, tone = "alert" }) {
  const ringColor = tone === "alert" ? "border-alert" : "border-teal";
  const coreColor = tone === "alert" ? "bg-alert" : "bg-teal";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {active &&
        [0, 0.7, 1.4].map((delay) => (
          <span
            key={delay}
            className={`absolute inset-0 rounded-full border-2 ${ringColor} animate-signal-ring`}
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      <div
        className={`relative flex items-center justify-center rounded-full ${coreColor} text-white shadow-lg`}
        style={{ width: size * 0.42, height: size * 0.42 }}
      >
        <div className={active ? "animate-pulse-dot" : ""}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2.5L19.5 5.5V11C19.5 15.9 16.4 19.9 12 21.5C7.6 19.9 4.5 15.9 4.5 11V5.5L12 2.5Z"
              stroke="white"
              strokeWidth="1.6"
              strokeLinejoin="round"
              fill="rgba(255,255,255,0.12)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
