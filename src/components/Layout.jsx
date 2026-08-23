import { NavLink, useLocation } from 'react-router-dom';
import { Shield, Users, Map, Clock, Siren, Stethoscope, Ambulance, Languages, BookOpen, ShieldCheck, User, Building2, Activity, FolderLock, Home as HomeIcon, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useMode } from '@/components/ModeContext';
import { cn } from '@/lib/utils';
import NotificationsBell from '@/components/NotificationsBell';

const navItems = [
  { to: '/', label: 'Dashboard', icon: HomeIcon },
  { to: '/sos', label: 'SOS', icon: Siren },
  { to: '/guardian-circle', label: 'Guardian Circle', icon: Users },
  { to: '/check-ins', label: 'Check-ins', icon: Clock },
  { to: '/safe-map', label: 'Safe Map', icon: Map },
  { to: '/doctors', label: 'Find a Doctor', icon: Stethoscope },
  { to: '/emergency-services', label: 'Emergency Services', icon: Ambulance },
  { to: '/communicate', label: 'Communicate', icon: Languages },
  { to: '/translator', label: 'Translator', icon: BookOpen },
  { to: '/safety-guides', label: 'Safety Guides', icon: ShieldCheck },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/helpline-directory', label: 'Helplines', icon: Building2 },
  { to: '/safety-dashboard', label: 'Safety Dashboard', icon: Activity },
  { to: '/document-locker', label: 'Document Locker', icon: FolderLock },
];

export default function Layout({ children }) {
  const { mode, toggleMode, onDuty } = useMode();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isVolunteer = mode === 'volunteer';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-sidebar text-sidebar-foreground">
        <div className="px-6 py-7 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-glow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-heading font-bold text-white text-lg leading-none">HavensLight</p>
              <p className="text-[11px] text-sidebar-foreground/60 mt-0.5">A haven, wherever you go</p>
            </div>
          </div>
          <NotificationsBell tone="sidebar" />
        </div>

        <nav className="flex-1 px-3 mt-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-sidebar-accent text-white'
                    : 'text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/50'
                )
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <ModeCard isVolunteer={isVolunteer} toggleMode={toggleMode} onDuty={onDuty} />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 glass border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-heading font-bold">HavensLight</span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationsBell tone="light" />
            <button onClick={() => setOpen(true)} className="p-2 -mr-2">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-72 bg-sidebar text-sidebar-foreground flex flex-col animate-fade-up">
            <div className="flex items-center justify-between px-6 py-6">
              <span className="font-heading font-bold text-white">Menu</span>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 px-3 space-y-1" onClick={() => setOpen(false)}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium',
                      isActive ? 'bg-sidebar-accent text-white' : 'text-sidebar-foreground/70'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <ModeCard isVolunteer={isVolunteer} toggleMode={toggleMode} onDuty={onDuty} />
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div key={location.pathname} className="animate-fade-up">{children}</div>
      </main>
    </div>
  );
}

function ModeCard({ isVolunteer, toggleMode, onDuty }) {
  return (
    <div className="p-4 m-3 rounded-2xl bg-sidebar-accent/60">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wide">Mode</span>
        {isVolunteer && (
          <span className={cn('flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full',
            onDuty ? 'bg-green-500/20 text-green-300' : 'bg-sidebar-foreground/10 text-sidebar-foreground/50')}>
            <span className={cn('w-1.5 h-1.5 rounded-full', onDuty ? 'bg-green-400 animate-beacon' : 'bg-sidebar-foreground/40')} />
            {onDuty ? 'On duty' : 'Off duty'}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-sidebar-background/50">
        <button
          onClick={() => isVolunteer && toggleMode()}
          className={cn('py-2 text-xs font-semibold rounded-lg transition-all',
            !isVolunteer ? 'bg-accent text-accent-foreground' : 'text-sidebar-foreground/60')}
        >
          Traveler
        </button>
        <button
          onClick={() => !isVolunteer && toggleMode()}
          className={cn('py-2 text-xs font-semibold rounded-lg transition-all',
            isVolunteer ? 'bg-accent text-accent-foreground' : 'text-sidebar-foreground/60')}
        >
          Guardian
        </button>
      </div>
    </div>
  );
}