import React, { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import { Card } from "../components/ui/Primitives";

const GUIDES = [
  {
    id: "awareness",
    title: "Before you go out",
    icon: "🧭",
    tips: [
      "Share your live location or a check-in with someone before heading somewhere unfamiliar — that's what HavensLight's check-ins are for.",
      "Keep your phone charged and know exactly how to trigger SOS with one tap before you need it, not while you need it.",
      "Learn a few basic local phrases for \"help\", \"police\", and \"call someone\" — or keep the Translator page bookmarked.",
      "Trust your gut. If a place, person, or situation feels wrong, it's reason enough to leave — you don't need a better justification than that.",
    ],
  },
  {
    id: "followed",
    title: "If you think you're being followed",
    icon: "👀",
    tips: [
      "Don't head straight home — walk toward somewhere public and well-lit: a shop, a hotel lobby, a group of people.",
      "Cross the street, change direction, or double back to confirm — if they mirror you, trust that confirmation.",
      "Call someone and talk out loud, even if just to narrate where you are — it signals you're not alone and creates a record of your location and time.",
      "Enter any open business and tell staff directly: \"I think someone is following me.\" Most will help without hesitation.",
    ],
  },
  {
    id: "verbal",
    title: "Setting a boundary",
    icon: "🗣️",
    tips: [
      "A loud, firm \"No\" or \"Stop\" draws attention — which is usually exactly what you want in an uncomfortable situation.",
      "You don't owe anyone politeness that compromises your safety. Directness isn't rude here — it's appropriate.",
      "If a situation is escalating, naming it out loud (\"You're making me uncomfortable, back up\") can de-escalate — it puts the other person on notice that others may be watching.",
    ],
  },
  {
    id: "physical",
    title: "If someone grabs you",
    icon: "✋",
    tips: [
      "Your goal is to create a gap and get away — not to win a fight. Escaping is success, even if it looks undignified.",
      "Loud noise works: yelling, a whistle, or your phone's alarm draws attention and can startle someone into loosening their grip.",
      "If grabbed by the wrist, twisting toward the thumb (the weakest point of the grip) is easier to break free from than pulling straight back.",
      "Go for balance, not force — a sharp movement toward someone's shins, feet, or knee can create the half-second gap you need to run.",
      "Formal self-defense classes (many run women-only sessions) build real muscle memory that's far more reliable under stress than reading tips — worth doing before you travel, not during.",
    ],
  },
  {
    id: "vehicle",
    title: "In a cab or rideshare",
    icon: "🚕",
    tips: [
      "Share your trip — driver name, vehicle number, live location — with a guardian contact before you get in, every time.",
      "Sit behind the driver, not beside them — it limits their reach and gives you a clearer view of the door.",
      "If the route deviates noticeably from what your map shows, say so out loud immediately: \"This isn't the way, please stop here.\"",
      "Trust discomfort over politeness — asking to be let out somewhere public is always a reasonable request, no explanation required.",
    ],
  },
  {
    id: "immediate",
    title: "If you're in immediate danger",
    icon: "🚨",
    tips: [
      "Trigger SOS first — it shares your exact location with your guardian circle and any nearby on-duty volunteers instantly.",
      "Call 112 (India's national emergency number) if you're able to — it reaches police, fire, or medical response.",
      "Getting away matters more than fighting fair. Aim for eyes, throat, or groin if physically cornered — then run toward people, not away from them.",
      "Once safe, get to a public place and stay there until help arrives — don't try to continue on alone.",
    ],
  },
];

export default function SelfDefense() {
  const [openId, setOpenId] = useState(GUIDES[0].id);

  return (
    <div>
      <PageHeader
        eyebrow="Be prepared"
        title="Self-defense guides"
        subtitle="Practical, situation-based safety guidance — not a replacement for a real self-defense class, but a solid starting point."
      />

      <div className="space-y-3">
        {GUIDES.map((g) => {
          const open = openId === g.id;
          return (
            <Card key={g.id} className="overflow-hidden">
              <button
                onClick={() => setOpenId(open ? null : g.id)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden="true">
                    {g.icon}
                  </span>
                  <span className="font-display text-base text-ink">{g.title}</span>
                </div>
                <span className={`text-ink-soft transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
              </button>
              {open && (
                <ul className="space-y-2.5 border-t border-ink/10 px-4 py-4 pl-14">
                  {g.tips.map((tip, i) => (
                    <li key={i} className="list-disc text-sm leading-relaxed text-ink-soft marker:text-teal">
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-ink-soft">
        This guidance is general and situational — it's not a substitute for a proper self-defense course,
        and no set of tips guarantees safety. When in doubt, prioritize getting away and getting help over
        anything else on this page.
      </p>
    </div>
  );
}
