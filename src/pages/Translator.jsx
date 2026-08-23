import { useState } from 'react';
import { BookOpen, Loader2, Volume2, Languages, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const LANGS = ['Hindi','Marathi','Tamil','Telugu','Kannada','Malayalam','Bengali','Gujarati','Punjabi','Urdu','Spanish','French','Arabic','Thai','Vietnamese','Japanese'];

const CATEGORIES = {
  Essential: ['Hello', 'Thank you', 'Please', 'Yes / No', "I don't understand", 'Can you help me?', 'How much does this cost?'],
  Emergency: ['I need help!', 'Call the police', 'Call an ambulance', "I'm lost", 'Where is the embassy?', 'I need a doctor now'],
  Medical: ['Where does it hurt?', 'I have a fever', 'I am allergic to penicillin', 'I need pain medicine', 'Where is the nearest pharmacy?', 'I am pregnant', 'I have been in pain for two days', 'Do I need a prescription?'],
  Navigation: ['Where is the nearest hospital?', 'How do I get to the bus station?', 'Is this area safe?', 'Can you show me on the map?', 'What time does it open?'],
  Food: ['Is this spicy?', 'I am vegetarian', 'No peanuts please', 'Can I have bottled water?', 'How much is this?'],
};

const CAT_ICON = { Essential: '💬', Emergency: '🚨', Medical: '🩺', Navigation: '🧭', Food: '🍽️' };

export default function Translator() {
  const [lang, setLang] = useState('Hindi');
  const [category, setCategory] = useState('Essential');
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState({});

  const key = (p) => `${category}|${p}|${lang}`;

  const translate = async (phrase) => {
    const k = key(phrase);
    if (cache[k]) return;
    setLoading((s) => ({ ...s, [k]: true }));
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate this travel phrase from English to ${lang}. Return ONLY the translated text.\n\n"${phrase}"`,
      });
      const text = typeof res === 'string' ? res : res?.response || '';
      setCache((c) => ({ ...c, [k]: text }));
    } catch {
      setCache((c) => ({ ...c, [k]: 'Translation failed' }));
    }
    setLoading((s) => ({ ...s, [k]: false }));
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
          <BookOpen className="w-4 h-4" /> Phrasebook
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">Translator & Medical Phrases</h1>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
          Essential phrases and common medical questions, translated on tap. Tap any phrase to hear it in the local language.
        </p>

        <div className="flex items-center gap-2 mt-5">
          <Languages className="w-4 h-4 text-muted-foreground" />
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>{LANGS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          {Object.keys(CATEGORIES).map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={cn('flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all',
                category === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary/40')}>
              <span>{CAT_ICON[c]}</span> {c}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-2">
          {CATEGORIES[category].map((phrase) => {
            const k = key(phrase);
            const tr = cache[k];
            return (
              <div key={phrase} className="rounded-2xl border border-border bg-card p-4">
                <button onClick={() => translate(phrase)} className="w-full text-left flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{phrase}</span>
                  {loading[k] ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </button>
                {tr && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2 animate-fade-up">
                    <p className="text-sm text-primary font-medium">{tr}</p>
                    <button onClick={() => speak(tr)} className="p-1.5 rounded-lg hover:bg-secondary"><Volume2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-6 text-center">
          Translations are AI-generated. For medical emergencies, always confirm with a local professional.
        </p>
      </div>
    </Layout>
  );
}