import { useState } from 'react';
import { Loader2, Languages, ArrowRight, Copy, Check, Volume2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LANGS = ['English','Hindi','Marathi','Tamil','Telugu','Kannada','Malayalam','Bengali','Gujarati','Punjabi','Urdu','Spanish','French','German','Arabic','Chinese','Japanese','Russian','Portuguese','Italian'];
const PHRASES = ['Where is the nearest hospital?','I need help, please call the police.','Can you help me? I am lost.','How much does this cost?','I need a doctor immediately.'];

export default function Translator() {
  const [from, setFrom] = useState('English');
  const [to, setTo] = useState('Hindi');
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const translate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following text from ${from} to ${to}. Return ONLY the translated text, nothing else.\n\n"${text}"`,
      });
      setResult(typeof res === 'string' ? res : res?.response || JSON.stringify(res));
    } catch {
      setResult('Translation failed. Try again.');
    }
    setLoading(false);
  };

  const swap = () => { setFrom(to); setTo(from); setResult(''); };
  const copy = () => { navigator.clipboard?.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const speak = () => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(result);
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={from} onValueChange={(v) => { setFrom(v); setResult(''); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{LANGS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
        </Select>
        <button onClick={swap} className="p-2 rounded-lg bg-secondary hover:bg-secondary/70">
          <ArrowRight className="w-4 h-4" />
        </button>
        <Select value={to} onValueChange={(v) => { setTo(v); setResult(''); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{LANGS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a phrase to translate…" rows={3} />
      <div className="flex flex-wrap gap-2">
        {PHRASES.map((p) => (
          <button key={p} onClick={() => { setText(p); setResult(''); }}
            className="text-xs px-2.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/70 text-left">
            {p}
          </button>
        ))}
      </div>

      <Button onClick={translate} disabled={loading || !text.trim()} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
        {loading ? 'Translating…' : 'Translate'}
      </Button>

      {result && (
        <div className="rounded-xl border border-border bg-card p-4 animate-fade-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">In {to}</span>
            <div className="flex gap-1">
              <button onClick={speak} className="p-1.5 rounded-lg hover:bg-secondary"><Volume2 className="w-4 h-4" /></button>
              <button onClick={copy} className="p-1.5 rounded-lg hover:bg-secondary">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-sm leading-relaxed">{result}</p>
        </div>
      )}
    </div>
  );
}