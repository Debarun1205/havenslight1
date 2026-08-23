import { useState } from 'react';
import { ShieldCheck, Eye, Hand, AlertTriangle, Phone, MapPin, Users, Clock, Sun, Lock } from 'lucide-react';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';

const SECTIONS = [
  {
    title: 'Situational Awareness',
    icon: Eye,
    color: 'text-blue-600 bg-blue-50',
    tips: [
      { title: 'Scan your surroundings', body: 'Make it a habit to note exits, crowds, and anyone watching you when you enter a new place. Trust your gut — if a spot feels off, leave.' },
      { title: 'Limit phone distractions', body: 'Walking while staring at your phone makes you an easy target. Pause in a safe, lit spot to check maps or messages.' },
      { title: 'Blend in', body: 'Avoid flashy jewelry or looking obviously lost. Confident body language — head up, steady pace — discourages opportunists.' },
      { title: 'Know local risks', body: 'Research common scams and no-go areas of your destination before arriving. Ask hotel staff about neighborhoods to avoid at night.' },
    ],
  },
  {
    title: 'Self-Defense Techniques',
    icon: Hand,
    color: 'text-red-600 bg-red-50',
    tips: [
      { title: 'Target vulnerable points', body: 'If grabbed, strike the eyes, throat, or groin. Use your elbows and knees — they are harder than fists and effective at close range.' },
      { title: 'Break a hold', body: 'Twist against the thumb (the weakest part of a grip) rather than pulling away from the fingers. Pull hard and run.' },
      { title: 'Use your voice', body: 'A loud, firm "NO!" or "BACK OFF!" draws attention and startles attackers. Don\'t be afraid to make a scene.' },
      { title: 'Carry a personal alarm', body: 'A keychain alarm or whistle can disorient an attacker and summon help. Keep it accessible, not buried in a bag.' },
    ],
  },
  {
    title: 'Personal Safety Tips',
    icon: ShieldCheck,
    color: 'text-green-600 bg-green-50',
    tips: [
      { title: 'Share your itinerary', body: 'Tell your Guardian Circle where you\'re going and when to expect you. Use HavensLight check-ins for automatic escalation.' },
      { title: 'Stay in lit, busy areas', body: 'Avoid empty streets, parks, and alleys after dark. Stick to main roads and well-lit paths even if it means a longer route.' },
      { title: 'Secure your valuables', body: 'Use a money belt or hidden pouch. Carry only what you need for the day; leave the rest and a backup card in your hotel safe.' },
      { title: 'Trust verified transport', body: 'Use ride apps with driver details and trip sharing. Avoid unmarked taxis, especially at night or when alone.' },
    ],
  },
  {
    title: 'Emergency Response',
    icon: AlertTriangle,
    color: 'text-amber-600 bg-amber-50',
    tips: [
      { title: 'Know the local emergency number', body: '112 works across India for police, ambulance, and fire. Save it and your Guardian Circle in your phone before you travel.' },
      { title: 'Have an exit plan', body: 'In any venue, note the nearest exit. In hotels, count the doors to the stairwell in case of smoke or darkness.' },
      { title: 'Keep emergency cash', body: 'Stash local currency separately for taxis, calls, or bribes out of a tight spot. A little cash solves many travel crises.' },
      { title: 'Trigger HavensLight SOS', body: 'If you feel threatened, trigger SOS — it captures your location and alerts your contacts instantly. Better safe than sorry.' },
    ],
  },
];

export default function SafetyGuides() {
  const [active, setActive] = useState(0);
  const section = SECTIONS[active];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
          <ShieldCheck className="w-4 h-4" /> Stay sharp, stay safe
        </div>
        <h1 className="font-heading text-2xl sm:3xl font-bold">Self-Defense & Safety Guides</h1>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
          Practical, illustrated tactics for situational awareness, self-defense, and emergency response — built for travelers.
        </p>

        <div className="flex flex-wrap gap-2 mt-5">
          {SECTIONS.map((s, i) => (
            <button key={s.title} onClick={() => setActive(i)}
              className={cn('flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all',
                active === i ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/40')}>
              <s.icon className="w-4 h-4" /> {s.title}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {section.tips.map((tip, i) => (
            <div key={tip.title} className="flex gap-4 rounded-2xl border border-border bg-card p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', section.color)}>
                <section.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">{tip.title}</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{tip.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-primary/5 border border-primary/20 p-5">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
            <Phone className="w-4 h-4" /> Quick checklist before you head out
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex gap-2"><MapPin className="w-4 h-4 mt-0.5 text-primary" /> Share your destination with your Guardian Circle</li>
            <li className="flex gap-2"><Clock className="w-4 h-4 mt-0.5 text-primary" /> Set a check-in time</li>
            <li className="flex gap-2"><Sun className="w-4 h-4 mt-0.5 text-primary" /> Check daylight and local safety advisories</li>
            <li className="flex gap-2"><Lock className="w-4 h-4 mt-0.5 text-primary" /> Secure valuables and carry emergency cash</li>
            <li className="flex gap-2"><Users className="w-4 h-4 mt-0.5 text-primary" /> Keep verified transport apps ready</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}