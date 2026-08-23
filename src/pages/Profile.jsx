import { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Shield, Bell, MessageCircle, Check, AlertCircle, Loader2, LogOut } from 'lucide-react';
import Layout from 'src/components/Layout';
import { base44 } from 'src/api/base44Client';
import { useAuth } from 'src/lib/AuthContext';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Switch } from 'src/components/ui/switch';
import { useToast } from 'src/components/ui/use-toast';
import { cn } from 'src/lib/utils';

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({ comm_whatsapp: true, comm_email: true, comm_sos: true, comm_checkin: true });
  const [counts, setCounts] = useState({ contacts: 0, checkins: 0, sos: 0 });
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.full_name || '');
      setPrefs({
        comm_whatsapp: user.comm_whatsapp ?? true,
        comm_email: user.comm_email ?? true,
        comm_sos: user.comm_sos ?? true,
        comm_checkin: user.comm_checkin ?? true,
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [contacts, checkins, sos] = await Promise.all([
          base44.entities.EmergencyContact.list(),
          base44.entities.CheckIn.list(),
          base44.entities.SOSAlert.list(),
        ]);
        setCounts({
          contacts: contacts.filter((c) => c.created_by_id === user.id).length,
          checkins: checkins.filter((c) => c.created_by_id === user.id && c.status === 'pending').length,
          sos: sos.filter((c) => c.created_by_id === user.id).length,
        });
      } catch { /* ignore */ }
      setLoadingCounts(false);
    })();
  }, [user]);

  const save = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: name, ...prefs });
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    } catch (e) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const togglePref = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const securityItems = [
    { ok: counts.contacts > 0, label: `${counts.contacts} Guardian Circle contact${counts.contacts !== 1 ? 's' : ''} added` },
    { ok: counts.contacts >= 2, label: 'At least 2 emergency contacts' },
    { ok: counts.sos > 0, label: 'SOS tested at least once' },
    { ok: true, label: 'Account email verified' },
  ];
  const securityScore = Math.round((securityItems.filter((s) => s.ok).length / securityItems.length) * 100);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
          <UserIcon className="w-4 h-4" /> Your account
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">Profile Settings</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Manage your details, communication preferences, and security status.</p>

        {/* Account details */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold flex items-center gap-2"><UserIcon className="w-4 h-4 text-primary" /> Account details</h2>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-secondary/50 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" /> {user?.email || '—'}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Role: <span className="font-medium capitalize">{user?.role || 'user'}</span></p>
        </section>

        {/* Communication preferences */}
        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Communication preferences</h2>
          <div className="mt-4 space-y-1">
            {[
              { key: 'comm_whatsapp', label: 'WhatsApp notifications', icon: MessageCircle, desc: 'Receive safety alerts via WhatsApp' },
              { key: 'comm_email', label: 'Email alerts', icon: Mail, desc: 'Receive summaries and escalations by email' },
              { key: 'comm_sos', label: 'Auto-notify on SOS', icon: AlertCircle, desc: 'Alert your Guardian Circle when SOS triggers' },
              { key: 'comm_checkin', label: 'Check-in reminders', icon: Bell, desc: 'Get notified before a check-in expires' },
            ].map((p) => (
              <div key={p.key} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex items-start gap-3">
                  <p.icon className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                </div>
                <Switch checked={prefs[p.key]} onCheckedChange={() => togglePref(p.key)} />
              </div>
            ))}
          </div>
        </section>

        {/* Security status */}
        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Security status</h2>
            <span className={cn('text-sm font-bold px-2.5 py-1 rounded-full',
              securityScore >= 75 ? 'bg-green-100 text-green-700' : securityScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}>
              {securityScore}% ready
            </span>
          </div>
          {loadingCounts ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <ul className="mt-4 space-y-2">
              {securityItems.map((s) => (
                <li key={s.label} className="flex items-center gap-2.5 text-sm">
                  <span className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                    s.ok ? 'bg-green-100 text-green-600' : 'bg-secondary text-muted-foreground')}>
                    {s.ok ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  </span>
                  <span className={s.ok ? 'text-foreground' : 'text-muted-foreground'}>{s.label}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex items-center justify-between mt-6">
          <Button variant="ghost" onClick={() => logout()} className="text-destructive hover:text-destructive">
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </Layout>
  );
}