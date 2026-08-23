import { useEffect, useState } from 'react';
import { Users, Plus, Shield } from 'lucide-react';
import Layout from '@/components/Layout';
import ContactCard from '@/components/safety/ContactCard';
import ContactForm from '@/components/safety/ContactForm';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

export default function GuardianCircle() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const load = () => {
    setLoading(true);
    base44.entities.EmergencyContact.list('priority', 50)
      .then((data) => setContacts(data.sort((a, b) => (a.priority || 99) - (b.priority || 99))))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = (data) => {
    if (editing) {
      base44.entities.EmergencyContact.update(editing.id, data).then(load);
    } else {
      base44.entities.EmergencyContact.create(data).then(load);
    }
    setEditing(null);
  };

  const remove = () => {
    base44.entities.EmergencyContact.delete(toDelete.id).then(() => { load(); setToDelete(null); });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
              <Shield className="w-4 h-4" /> Your safety net
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold">Guardian Circle</h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
              These are the people notified the moment you trigger SOS. Add trusted contacts and order them by priority.
            </p>
          </div>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="shrink-0">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl bg-secondary animate-pulse" />)}
          </div>
        ) : contacts.length === 0 ? (
          <div className="mt-8 rounded-3xl border-2 border-dashed border-border p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <p className="font-semibold mt-4">Your circle is empty</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Add at least one trusted contact so they're notified when you need help.
            </p>
            <Button onClick={() => setFormOpen(true)} className="mt-5">
              <Plus className="w-4 h-4" /> Add your first guardian
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            {contacts.map((c) => (
              <ContactCard key={c.id} contact={c} onEdit={(ct) => { setEditing(ct); setFormOpen(true); }} onDelete={setToDelete} />
            ))}
          </div>
        )}
      </div>

      <ContactForm open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(null); }} onSubmit={submit} initial={editing} />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove {toDelete?.name}?</AlertDialogTitle></AlertDialogHeader>
          <p className="text-sm text-muted-foreground px-6">They will no longer be notified on SOS.</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}