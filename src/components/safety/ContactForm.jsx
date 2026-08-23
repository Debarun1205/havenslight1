import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const relationships = ['Family', 'Partner', 'Friend', 'Colleague', 'Other'];

export default function ContactForm({ open, onOpenChange, onSubmit, initial }) {
  const [name, setName] = useState(initial?.name || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [email, setEmail] = useState(initial?.email || '');
  const [relationship, setRelationship] = useState(initial?.relationship || 'Friend');
  const [priority, setPriority] = useState(initial?.priority?.toString() || '1');
  const [whatsapp, setWhatsapp] = useState(initial?.notify_whatsapp ?? true);

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ name, phone, email, relationship, priority: parseInt(priority, 10), notify_whatsapp: whatsapp });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit contact' : 'Add guardian'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Doe" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+91…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="optional" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Relationship</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {relationships.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Input id="priority" type="number" min="1" max="10" value={priority} onChange={(e) => setPriority(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-secondary p-3">
            <div>
              <p className="text-sm font-medium">Notify via WhatsApp</p>
              <p className="text-xs text-muted-foreground">Send SOS alerts on WhatsApp</p>
            </div>
            <Switch checked={whatsapp} onCheckedChange={setWhatsapp} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{initial ? 'Save' : 'Add contact'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}