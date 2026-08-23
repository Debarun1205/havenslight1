import { useEffect, useMemo, useState } from 'react';
import { Phone, Search, Clock, Building2, ShieldAlert, MapPin } from 'lucide-react';
import Layout from '@/components/Layout';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'Police', 'Ambulance', 'Fire', 'Women', 'Child', 'Tourist', 'Embassy', 'Mental Health', 'Poison Control', 'Other'];
const CAT_STYLE = {
  Police: 'text-blue-600 bg-blue-50', Ambulance: 'text-red-600 bg-red-50', Fire: 'text-orange-600 bg-orange-50',
  Women: 'text-pink-600 bg-pink-50', Child: 'text-purple-600 bg-purple-50', Tourist: 'text-green-600 bg-green-50',
  Embassy: 'text-indigo-600 bg-indigo-50', 'Mental Health': 'text-teal-600 bg-teal-50', 'Poison Control': 'text-amber-600 bg-amber-50',
  Other: 'text-slate-600 bg-slate-50'
};

export default function HelplineDirectory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [region, setRegion] = useState('All');

  useEffect(() => {
    base44.entities.HelplineNumber.list('-created_date', 200).then(setItems).finally(() => setLoading(false));
  }, []);

  const regions = useMemo(() => ['All', ...Array.from(new Set(items.map((h) => h.region).filter(Boolean)))], [items]);

  const filtered = useMemo(() => items
    .filter((h) => category === 'All' || h.category === category)
    .filter((h) => region === 'All' || h.region === region)
    .filter((h) => !query || h.name?.toLowerCase().includes(query.toLowerCase()) || h.notes?.toLowerCase().includes(query.toLowerCase()))
  , [items, category, region, query]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
          <Phone className="w-4 h-4" /> One tap from help
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">Helpline Directory</h1>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
          Searchable emergency helplines, police, and embassy contacts — categorized by service and region.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 mt-5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search services or notes…" className="pl-9" />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{regions.map((r) => <SelectItem key={r} value={r}>{r === 'All' ? 'All regions' : r}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground mt-4">{filtered.length} contacts</p>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-3 mt-3">{[0,1,2,3].map((i) => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center mt-3">
            <ShieldAlert className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="font-semibold mt-3">No contacts found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            {filtered.map((h) => {
              const isEmbassy = h.category === 'Embassy';
              return (
                <div key={h.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', CAT_STYLE[h.category] || CAT_STYLE.Other)}>
                    {isEmbassy ? <Building2 className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{h.name}</p>
                    <p className="text-xs text-muted-foreground">{h.category}{h.region ? ` · ${h.region}` : ''}{h.language && h.language !== 'Multilingual' ? ` · ${h.language}` : ''}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {h.available_24h && <span className="text-[10px] flex items-center gap-0.5 text-green-600 font-medium"><Clock className="w-2.5 h-2.5" /> 24/7</span>}
                      {h.notes && <span className="text-[11px] text-muted-foreground truncate">{h.notes}</span>}
                    </div>
                  </div>
                  <a href={`tel:${h.phone?.replace(/[^\d+]/g,'')}`} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shrink-0">
                    <Phone className="w-4 h-4" /> Call
                  </a>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-primary/5 border border-primary/20 p-4 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">Can't find your region? Add a number from the <span className="text-primary font-medium">Communicate → Helplines</span> tab and it'll appear here.</p>
        </div>
      </div>
    </Layout>
  );
}