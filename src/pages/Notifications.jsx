import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Siren, Clock, Shield, Users } from 'lucide-react';
import Layout from '@/components/Layout';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TYPE_ICON = { sos: Siren, checkin: Clock, volunteer: Users, system: Shield, general: Bell };
const TYPE_COLOR = {
  sos: 'text-red-600 bg-red-50', checkin: 'text-amber-600 bg-amber-50',
  volunteer: 'text-blue-600 bg-blue-50', system: 'text-primary bg-primary/10', general: 'text-slate-600 bg-slate-50'
};

function timeAgo(d) {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    const all = await base44.entities.Notification.list('-created_date', 100);
    setItems(user ? all.filter((n) => n.created_by_id === user.id) : all);
    setLoading(false);
  };
  useEffect(() => { load(); }, [user]);

  const unread = items.filter((n) => !n.read).length;
  const shown = filter === 'unread' ? items.filter((n) => !n.read) : items;

  const markRead = async (n) => {
    if (!n.read) await base44.entities.Notification.update(n.id, { read: true });
    if (n.link) navigate(n.link);
    load();
  };
  const markAll = async () => {
    await Promise.all(items.filter((n) => !n.read).map((n) => base44.entities.Notification.update(n.id, { read: true })));
    load();
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
          <Bell className="w-4 h-4" /> Activity
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">Your in-app alerts and activity.</p>
          </div>
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={markAll}>
              <CheckCheck className="w-4 h-4" /> Mark all read
            </Button>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          {['all', 'unread'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all capitalize',
                filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border')}>
              {f === 'all' ? 'All' : `Unread${unread ? ` (${unread})` : ''}`}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-2">
          {loading ? (
            [0,1,2].map((i) => <div key={i} className="h-20 rounded-2xl bg-secondary animate-pulse" />)
          ) : shown.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="font-semibold mt-3">You're all caught up</p>
              <p className="text-sm text-muted-foreground mt-1">No {filter === 'unread' ? 'unread ' : ''}notifications.</p>
            </div>
          ) : shown.map((n) => {
            const Icon = TYPE_ICON[n.type] || Bell;
            return (
              <button key={n.id} onClick={() => markRead(n)}
                className={cn('w-full flex items-start gap-3 rounded-2xl border bg-card p-4 text-left transition-all hover:shadow-soft',
                  !n.read ? 'border-primary/30' : 'border-border')}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', TYPE_COLOR[n.type] || TYPE_COLOR.general)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">{n.title}</p>
                    <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(n.created_date)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  {!n.read && <span className="inline-block mt-1.5 text-[10px] font-semibold text-primary">New</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}