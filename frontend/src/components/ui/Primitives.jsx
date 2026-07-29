import React from "react";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-ink/10 bg-white/70 shadow-card backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Field({ label, htmlFor, error, children, hint, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink/80">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
      {error && <p className="text-xs font-medium text-alert-deep">{error}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink " +
  "placeholder:text-ink-soft/60 focus-visible:outline-teal focus-visible:outline-2 focus-visible:outline " +
  "focus:border-teal transition-colors";

export function Input(props) {
  return <input className={inputClass} {...props} />;
}

export function Select(props) {
  return <select className={inputClass} {...props} />;
}

export function Textarea(props) {
  return <textarea className={inputClass} {...props} />;
}

export function Badge({ tone = "teal", children }) {
  const tones = {
    teal: "bg-teal-soft text-teal-deep",
    gold: "bg-gold-soft text-[#8a5c14]",
    alert: "bg-alert-soft text-alert-deep",
    navy: "bg-navy/10 text-navy",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-white/40 px-6 py-14 text-center">
      {icon && <div className="text-3xl">{icon}</div>}
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-soft">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-alert/30 bg-alert-soft px-3.5 py-2.5 text-sm text-alert-deep">
      {message}
    </div>
  );
}
