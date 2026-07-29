import React from "react";

export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-deep">{eyebrow}</p>
        )}
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-lg text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
