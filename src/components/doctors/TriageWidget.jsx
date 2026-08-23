import { useState } from 'react';
import { Loader2, Stethoscope, ArrowRight, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function TriageWidget({ onPickSpecialty }) {
  const [symptoms, setSymptoms] = useState('');
  const [language, setLanguage] = useState('English');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `A traveler reports these symptoms: "${symptoms}". Respond in ${language}. Suggest the most appropriate medical specialty to seek, an urgency level (routine / urgent / emergency), and a short one-sentence guidance in ${language}. Be conservative and safe.`,
        response_json_schema: {
          type: 'object',
          properties: {
            specialty: { type: 'string' },
            urgency: { type: 'string', enum: ['routine', 'urgent', 'emergency'] },
            guidance: { type: 'string' },
          },
          required: ['specialty', 'urgency', 'guidance'],
        },
      });
      setResult(res);
    } catch (e) {
      setResult({ error: 'Could not analyze. Try again.' });
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-5">
      <div className="flex items-center gap-2 mb-1">
        <Stethoscope className="w-4.5 h-4.5 text-primary" />
        <p className="font-semibold text-sm">AI Symptom Triage</p>
        <span className="text-[10px] text-muted-foreground ml-auto">Free · Multilingual</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Describe what you're feeling. We'll suggest the right specialist and urgency.
      </p>
      <Textarea
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        placeholder="e.g. High fever and stomach pain since last night"
        rows={2}
        className="bg-background"
      />
      <div className="flex gap-2 mt-2">
        <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="Language" className="w-32 bg-background" />
        <Button onClick={run} disabled={loading || !symptoms.trim()} className="flex-1">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          {loading ? 'Analyzing…' : 'Find specialist'}
        </Button>
      </div>

      {result && !result.error && (
        <div className="mt-3 rounded-xl bg-background border border-border p-3 animate-fade-up">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold">Suggested specialty</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">{result.specialty}</span>
            <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium ml-auto',
              result.urgency === 'emergency' ? 'bg-destructive text-white' :
              result.urgency === 'urgent' ? 'bg-accent text-accent-foreground' : 'bg-secondary')}>
              {result.urgency}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{result.guidance}</p>
          {onPickSpecialty && (
            <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => onPickSpecialty(result.specialty)}>
              Show {result.specialty} doctors below
            </Button>
          )}
        </div>
      )}
      {result?.error && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="w-4 h-4" /> {result.error}
        </div>
      )}
    </div>
  );
}