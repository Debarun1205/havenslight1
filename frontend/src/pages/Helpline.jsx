import React from "react";
import PageHeader from "../components/ui/PageHeader";
import { Card, Badge } from "../components/ui/Primitives";

/**
 * Real, official, publicly-known Indian government helpline numbers —
 * these already operate 24/7 with multilingual human operators, which is
 * exactly what a "24/7 multilingual helpline" needs to actually be. Rather
 * than building (and staffing) a new call center from scratch, this page
 * is a fast-access directory to the ones that already exist.
 *
 * customNumbers below is where a business's own helpline (once it exists)
 * or city-specific numbers can be added later — same pattern as the doctor
 * seed file, edit this array and redeploy.
 */
const OFFICIAL_HELPLINES = [
  { name: "National Emergency Number", number: "112", description: "Police, fire, or medical — single number for any emergency" },
  { name: "Police", number: "100", description: "Direct police assistance" },
  { name: "Ambulance", number: "108", description: "Free emergency medical response" },
  { name: "Women's Helpline", number: "1091", description: "24/7, for women in distress or danger" },
  { name: "Women's Helpline (Domestic Abuse)", number: "181", description: "Government-run, multilingual support" },
  { name: "Tourist Helpline", number: "1363", description: "Multilingual — assistance specifically for travelers" },
  { name: "Child Helpline", number: "1098", description: "24/7, for a child in danger or distress" },
  { name: "Mental Health Helpline (KIRAN)", number: "1800-599-0019", description: "24/7, multilingual, free" },
  { name: "Disaster Management", number: "1078", description: "National Disaster Management Authority" },
];

// Add your own numbers here as they become available — this section
// renders automatically once the array isn't empty.
const customNumbers = [];

export default function Helpline() {
  return (
    <div>
      <PageHeader
        eyebrow="24/7 support"
        title="Emergency helplines"
        subtitle="Real government helplines, already staffed round the clock in multiple languages — one tap to call."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {OFFICIAL_HELPLINES.map((h) => (
          <Card key={h.name} className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium text-ink">{h.name}</p>
              <p className="text-xs text-ink-soft">{h.description}</p>
            </div>
            <a
              href={`tel:${h.number}`}
              className="flex shrink-0 items-center gap-2 rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal-deep"
            >
              <PhoneIcon />
              {h.number}
            </a>
          </Card>
        ))}
      </div>

      {customNumbers.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg text-ink">More numbers</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {customNumbers.map((h) => (
              <Card key={h.name} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-ink">{h.name}</p>
                  {h.description && <p className="text-xs text-ink-soft">{h.description}</p>}
                </div>
                <a
                  href={`tel:${h.number}`}
                  className="flex shrink-0 items-center gap-2 rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal-deep"
                >
                  <PhoneIcon />
                  {h.number}
                </a>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="mt-8 p-5">
        <Badge tone="gold">Coming soon</Badge>
        <p className="mt-2 text-sm text-ink-soft">
          A dedicated HavensLight helpline number will appear here once it's set up. For now, the numbers
          above are real, active, and staffed 24/7 — they're the fastest path to real help.
        </p>
      </Card>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}
