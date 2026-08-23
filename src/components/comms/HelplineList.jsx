import { useEffect, useState } from 'react';
import { Phone, Plus, Search, Clock, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Police','Ambulance','Fire','Women','Child','Tourist','Mental Health','Poison Control','Other'];
const CAT_COLOR = {
  Police: 'text-blue-600 bg-blue-50', Ambulance: 'text-red-600 bg-red-50', Fire: 'text-orange-600 bg-orange-50',
  Women: 'text-pink-600 bg-pink-50', Child: 'text-purple-600 bg-purple-50', Tourist: 'text-green-600 bg-green-50',
  'Mental Health': 'text-teal-600 bg-teal-50', 'Poison Control': 'text-amber-600 bg-amber-50', Other: 'text-slate-600 bg-slate-50'
};

export default function HelplineList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities.HelplineNumber.list().then(setItems).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter((h) =>
    !query || h.name?.toLowerCase().includes(query.toLowerCase()) || h.category?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search helplines…" className="pl-9" />
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Add</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[0,1,2].map((i) => <div key={i} className="h-16 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No helplines found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((h) => (
            <div key={h.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', CAT_COLOR[h.category] || CAT_COLOR.Other)}>
                <Phone className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{h.name}</p>
                <p className="text-xs text-muted-foreground">{h.category} · {h.language || 'Multilingual'}</p>
                {h.available_24h && <span className="text-[10px] flex items-center gap-0.5 text-green-600 font-medium mt-0.5"><Clock className="w-2.5 h-2.5" /> 24/7</span>}
              </div>
              <a href={`tel:${h.phone?.replace(/[^\d+]/g,'')}`} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shrink-0">
                <Phone className="w-4 h-4" /> {h.phone}
              </a>
            </div>
          ))}
        </div>
      )}

      <AddHelplineDialog open={open} onOpenChange={setOpen} onCreated={load} />
    </div>
  );
}

function AddHelplineDialog({ open, onOpenChange, onCreated }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Other');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('Multilingual');
  const [hours24, setHours24] = useState(true);

  const create = async () => {
    if (!name || !phone) return;
    await base44.entities.HelplineNumber.create({ name, category, phone, language, available_24h: hours24 });
    setName(''); setPhone(''); setCategory('Other'); setHours24(true);
    onOpenChange(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add helpline number</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Service name (e.g. Women Helpline)" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
          <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="Language (default Multilingual)" />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={hours24} onChange={(e) => setHours24(e.target.checked)} /> Available 24/7
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={create}>Add number</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}