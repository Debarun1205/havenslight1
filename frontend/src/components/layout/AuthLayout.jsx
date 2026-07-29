import React from "react";
import BrandMark from "../ui/BrandMark";

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left: brand panel — only real content here, no stock imagery */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink px-12 py-12 text-white md:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-teal/25" />
        <div className="absolute -right-10 top-16 h-40 w-40 rounded-full border border-teal/20" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal">
            <BrandMark size={20} />
          </div>
          <span className="font-display text-xl font-semibold">HavensLight</span>
        </div>

        <div className="relative max-w-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal">
            A haven, wherever the road takes you
          </p>
          <h2 className="font-display text-3xl font-medium leading-tight">
            A guardian circle and a trusted doctor,
            <br />
            in every city you visit.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            SOS alerts, scheduled check-ins, and a language-matched doctor directory built for
            solo travelers across India's states and languages.
          </p>
        </div>

        <p className="relative text-xs text-white/40">
          Emergency contacts are notified the moment you trigger SOS — no waiting.
        </p>
      </div>

      {/* Right: form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden">
            <span className="font-display text-xl font-semibold text-ink">HavensLight</span>
          </div>
          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-deep">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
