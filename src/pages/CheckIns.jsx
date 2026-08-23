import { useEffect, useState, useMemo } from 'react';
import { Clock, Plus, CheckCircle2, AlertTriangle, Timer, XCircle } from 'lucide-react';
import Layout from 'src/components/Layout';
import { base44 } from 'src/api/base44Client';
import { Button } from 'src/components/ui/button';
import { Card, CardContent } from 'src/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from 'src/components/ui/dialog';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Textarea } from 'src/components/ui/textarea';

export default function CheckIns() {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities.CheckIn.list('-created_date', 50)
      .then(setCheckins)
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const now = Date.now();
  const recompute = useMemo(() => checkins.map((c) => {
    const due = new Date(c.confirm_by).getTime();
    let state = c.status;
    if (c.status === 'pending' && due < now) state = 'escalated';
    return { ...c, _state: state, _due: due, _remaining: due - now };
  }), [checkins, now]);

  const confirm = async (c) => {
    await base44.entities.CheckIn.update(c.id, { status: 'confirmed', last_confirmed_at: new Date().toISOString() });
    load();
  };

  const cancel = async (c) => {
    await base44.entities.CheckIn.update(c.id, { status: 'confirmed', last_confirmed_at: new Date().toISOString(), activity_note: (c.activity_note || '') + ' [cancelled]' });
    load();
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
              <Clock className="w-4 h-4" /> Scheduled safety
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold">Check-ins</h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
              Tell us when you'll confirm you're safe. If you miss it, we escalate to your Guardian Circle automatically.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="shrink-0"><Plus className="w-4 h-4" /> New</Button>
        </div>

        <div className="space-y-3 mt-6">
          {loading ? (
            [0, 1].map((i) => <div key={i} className="h-24 rounded-2xl bg-secondary animate-pulse" />)
          ) : recompute.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-border p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Timer className="w-7 h-7 text-primary" />
              </div>
              <p className="font-semibold mt-4">No active check-ins</p>
              <p className="text-sm text-muted-foreground mt-1">Set a "safe by" time before heading out.</p>
            </div>
          ) : (
            recompute.map((c) => <CheckInRow key={c.id} c={c} onConfirm={() => confirm(c)} onCancel={() => cancel(c)} />)
          )}
        </div>
      </div>

      <NewCheckInDialog open={open} onOpenChange={setOpen} onCreated={load} />
    </Layout>
  );
}

function CheckInRow({ c, onConfirm, onCancel }) {
  const overdue = c._state === 'escalated';
  const confirmed = c._state === 'confirmed';
  const mins = Math.round(c._remaining / 60000);
  const label = c._remaining > 0
    ? (mins > 60 ? `${Math.round(mins / 60)}h ${mins % 60}m left` : `${mins}m left`)
    : 'Overdue';

  return (
    <Card className={overdue ? 'border-destructive/40 bg-destructive/5' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              confirmed ? 'bg-green-500/15' : overdue ? 'bg-destructive/15' : 'bg-primary/10'
            }`}>
              {confirmed ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                : overdue ? <AlertTriangle className="w-5 h-5 text-destructive" />
                : <Clock className="w-5 h-5 text-primary" />}
            </div>
            <div>
              <p className="text-sm font-medium">{c.activity_note || 'Check-in'}</p>
              <p className={`text-xs ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                Safe by {new Date(c.confirm_by).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
              </p>
              {!confirmed && <p className="text-xs mt-0.5">{label}</p>}
            </div>
          </div>
          {!confirmed && (
            <div className="flex flex-col gap-1.5">
              <Button size="sm" onClick={onConfirm} className="bg-green-600 hover:bg-green-700 text-white h-8">
                <CheckCircle2 className="w-3.5 h-3.5" /> I'm safe
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancel} className="h-8 text-xs text-muted-foreground">
                <XCircle className="w-3.5 h-3.5" /> Cancel
              </Button>
            </div>
          )}
        </div>
        {overdue && (
          <div className="mt-3 text-xs text-destructive bg-destructive/10 rounded-lg p-2.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Escalating — your Guardian Circle is being alerted.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NewCheckInDialog({ open, onOpenChange, onCreated }) {
  const [hours, setHours] = useState('2');
  const [note, setNote] = useState('');

  const create = async () => {
    const by = new Date(Date.now() + (parseInt(hours, 10) || 2) * 3600000).toISOString();
    await base44.entities.CheckIn.create({ confirm_by: by, status: 'pending', activity_note: note });
    setNote(''); setHours('2');
    onOpenChange(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>New check-in</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Confirm safe within</Label>
            <div className="grid grid-cols-4 gap-2">
              {['1', '2', '4', '8'].map((h) => (
                <button key={h} type="button" onClick={() => setHours(h)}
                  className={`py-2 rounded-xl text-sm font-medium ${hours === h ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                  {h}h
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note">What are you doing? (optional)</Label>
            <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Hiking to the viewpoint" rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={create}>Set check-in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}