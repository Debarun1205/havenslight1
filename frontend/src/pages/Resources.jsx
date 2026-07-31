import React from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import { Card } from "../components/ui/Primitives";

const RESOURCES = [
  { to: "/doctors", title: "Find a Doctor", description: "Search by city, specialty, and language", icon: "🩺" },
  { to: "/emergency-map", title: "Emergency Map", description: "Police, hospitals, clinics, pharmacies nearby", icon: "📍" },
  { to: "/translator", title: "Translator", description: "Translate a phrase, then show it or play it aloud", icon: "🗣️" },
  { to: "/helpline", title: "Helplines", description: "Real 24/7 government helplines, one tap to call", icon: "☎️" },
  { to: "/self-defense", title: "Self-Defense Guides", description: "Practical, situation-based safety tips", icon: "🛡️" },
];

export default function Resources() {
  return (
    <div>
      <PageHeader eyebrow="More" title="Resources" subtitle="Everything else HavensLight offers, in one place." />
      <div className="grid gap-3 sm:grid-cols-2">
        {RESOURCES.map((r) => (
          <Link key={r.to} to={r.to}>
            <Card className="flex h-full items-start gap-3 p-4 transition-transform hover:-translate-y-0.5">
              <span className="text-2xl" aria-hidden="true">
                {r.icon}
              </span>
              <div>
                <p className="font-display text-base text-ink">{r.title}</p>
                <p className="text-sm text-ink-soft">{r.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
