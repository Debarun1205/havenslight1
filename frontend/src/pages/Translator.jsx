import React, { useState } from "react";
import { translateText } from "../api/endpoints";
import PageHeader from "../components/ui/PageHeader";
import { Card, Field, Select, Textarea, ErrorBanner } from "../components/ui/Primitives";
import Button from "../components/ui/Button";

// Deliberately a curated subset of India's 22 scheduled languages — these
// are the ones free translation/speech engines actually support reliably.
// Being honest here matters more than looking comprehensive: claiming
// support for a language the underlying API can't really handle would
// produce garbled translations at the exact moment someone's relying on it.
const LANGUAGES = [
  { name: "English", code: "en", speechLocale: "en-IN" },
  { name: "Hindi", code: "hi", speechLocale: "hi-IN" },
  { name: "Bengali", code: "bn", speechLocale: "bn-IN" },
  { name: "Tamil", code: "ta", speechLocale: "ta-IN" },
  { name: "Telugu", code: "te", speechLocale: "te-IN" },
  { name: "Marathi", code: "mr", speechLocale: "mr-IN" },
  { name: "Gujarati", code: "gu", speechLocale: "gu-IN" },
  { name: "Kannada", code: "kn", speechLocale: "kn-IN" },
  { name: "Malayalam", code: "ml", speechLocale: "ml-IN" },
  { name: "Punjabi", code: "pa", speechLocale: "pa-IN" },
  { name: "Odia", code: "or", speechLocale: "or-IN" },
  { name: "Assamese", code: "as", speechLocale: "as-IN" },
  { name: "Urdu", code: "ur", speechLocale: "ur-IN" },
  { name: "Nepali", code: "ne", speechLocale: "ne-NP" },
];

const QUICK_PHRASES = [
  "I need help",
  "Please call the police",
  "I need a doctor",
  "Where is the nearest hospital?",
  "I am lost",
  "Please take me to this address",
];

export default function Translator() {
  const [source, setSource] = useState("en");
  const [target, setTarget] = useState("hi");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranslate = async (phrase) => {
    const toTranslate = phrase ?? text;
    if (!toTranslate.trim()) return;
    if (phrase) setText(phrase);
    setError("");
    setLoading(true);
    setResult("");
    try {
      const { data } = await translateText({ text: toTranslate, source, target });
      setResult(data.translatedText);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't translate that right now — try a shorter phrase.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setSource(target);
    setTarget(source);
    setText(result);
    setResult(text);
  };

  const speak = (value, langCode) => {
    if (!("speechSynthesis" in window) || !value) return;
    const locale = LANGUAGES.find((l) => l.code === langCode)?.speechLocale || "en-IN";
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = locale;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Communicate"
        title="Translator"
        subtitle="Translate a phrase, then show the screen or play it aloud — free, works with no account."
      />

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <Field label="From" className="flex-1">
            <Select value={source} onChange={(e) => setSource(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </Select>
          </Field>
          <button
            onClick={handleSwap}
            aria-label="Swap languages"
            className="mt-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink-soft hover:bg-sand-dim"
          >
            <SwapIcon />
          </button>
          <Field label="To" className="flex-1">
            <Select value={target} onChange={(e) => setTarget(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_PHRASES.map((p) => (
            <button
              key={p}
              onClick={() => handleTranslate(p)}
              className="rounded-full border border-teal/30 bg-teal-soft px-3 py-1.5 text-xs font-medium text-teal-deep hover:bg-teal-soft/70"
            >
              {p}
            </button>
          ))}
        </div>

        <Field label="Phrase" htmlFor="phrase" className="mt-4">
          <Textarea
            id="phrase"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type what you need to say..."
          />
        </Field>

        <ErrorBanner message={error} />

        <Button className="mt-3" onClick={() => handleTranslate()} disabled={loading || !text.trim()}>
          {loading ? "Translating..." : "Translate"}
        </Button>

        {result && (
          <div className="mt-5 rounded-xl border border-teal/20 bg-teal-soft/40 p-4">
            <p className="text-lg font-medium text-ink">{result}</p>
            <div className="mt-3 flex gap-2">
              <Button variant="subtle" className="px-3 py-1.5 text-xs" onClick={() => speak(result, target)}>
                🔊 Play aloud
              </Button>
              <Button
                variant="ghost"
                className="px-3 py-1.5 text-xs"
                onClick={() => navigator.clipboard?.writeText(result)}
              >
                Copy
              </Button>
            </div>
          </div>
        )}
      </Card>

      <p className="mt-4 text-xs text-ink-soft">
        Translation quality varies by language pair, and "Play aloud" depends on voices available on your
        device — some languages may sound better than others, or fall back to a default voice.
      </p>
    </div>
  );
}

function SwapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 4v13M7 17l-3-3M7 17l3-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 20V7M17 7l3 3M17 7l-3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
