import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function NotificationsBell({ tone = 'sidebar' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    const all = await base44.entities.Notification.list('-created_date', 50);
    let mine = all.filter((n) => n.created_by_id === user.id);
    if (mine.length === 0) {
      await base44.entities.Notification.create({
        title: 'Welcome to HavensLight',
        message: 'Your safety companion is ready. Add your Guardian Circle contacts to get started.',
        type: 'system',
        link: '/guardian-circle',
      });
      const fresh = await base44.entities.Notification.list('-created_date', 50);
      mine = fresh.filter((n) => n.created_by_id === user.id);
    }
    setItems(mine);
  };

  useEffect(() => { load(); }, [user]);

  const unread = items.filter((n) => !n.read).length;

  const openItem = async (n) => {
    if (!n.read) await base44.entities.Notification.update(n.id, { read: true });
    setOpen(false);
    if (n.link) navigate(n.link);
    else navigate('/notifications');
    setTimeout(load, 300);
  };

  const btnCls = tone === 'sidebar'
    ? 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50'
    : 'text-foreground hover:bg-secondary';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={cn('relative p-2 rounded-lg transition-colors', btnCls)}>
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-[10px] font-bold text-accent-foreground flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-semibold text-sm">Notifications</span>
          <button className="text-xs text-primary font-medium hover:underline" onClick={() => { setOpen(false); navigate('/notifications'); }}>
            View all
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notifications yet</p>
          ) : items.slice(0, 6).map((n) => (
            <button key={n.id} onClick={() => openItem(n)} className={cn('w-full text-left px-4 py-3 border-b border-border hover:bg-secondary/50', !n.read && 'bg-primary/5')}>
              <p className="text-sm font-medium truncate">{n.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}