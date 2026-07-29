import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import BrandMark from "../ui/BrandMark";

const navItems = [
  { to: "/", label: "Dashboard", icon: HomeIcon, end: true },
  { to: "/sos", label: "SOS", icon: SosIcon },
  { to: "/checkins", label: "Check-ins", icon: ClockIcon },
  { to: "/contacts", label: "Contacts", icon: UsersIcon },
  { to: "/doctors", label: "Find a Doctor", icon: StethoscopeIcon },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-sand">
      {/* Mobile top bar — brand + connection status + profile, no hidden nav */}
      <div
        className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-white/10 bg-ink px-4 py-3 md:hidden"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <Brand />
        <div className="flex items-center gap-3">
          <span
            className={`h-2 w-2 rounded-full ${connected ? "bg-teal" : "bg-white/30"}`}
            aria-label={connected ? "Live safety link active" : "Connecting"}
          />
          <button
            aria-label="Account"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/20 font-display text-sm text-teal"
          >
            {user?.name?.[0]?.toUpperCase() || "?"}
          </button>
        </div>
      </div>

      {profileOpen && (
        <div className="fixed inset-x-4 top-16 z-30 rounded-xl border border-ink/10 bg-white p-4 shadow-card md:hidden">
          <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
          <p className="truncate text-xs text-ink-soft">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg bg-sand-dim px-3 py-2 text-sm font-medium text-ink"
          >
            <LogoutIcon />
            Log out
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-ink text-white md:flex">
        <div className="px-6 py-7">
          <Brand />
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-teal text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <div className="mb-3 flex items-center gap-2 px-3">
            <span
              className={`h-2 w-2 rounded-full ${connected ? "bg-teal" : "bg-white/30"}`}
              aria-hidden="true"
            />
            <span className="text-xs text-white/50">
              {connected ? "Live safety link active" : "Connecting..."}
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal/20 font-display text-sm text-teal">
              {user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="truncate text-xs text-white/50">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white"
          >
            <LogoutIcon />
            Log out
          </button>
        </div>
      </aside>

      <main className="min-h-screen flex-1 px-4 pb-24 pt-20 md:px-10 md:pb-10 md:pt-10">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom tab bar — every destination one thumb-tap away, SOS included */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-ink/10 bg-white md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary"
      >
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                isActive
                  ? to === "/sos"
                    ? "text-alert-deep"
                    : "text-teal-deep"
                  : "text-ink-soft"
              }`
            }
          >
            {({ isActive }) =>
              to === "/sos" ? (
                <>
                  <span
                    className={`flex h-9 w-9 -translate-y-2.5 items-center justify-center rounded-full shadow-card ${
                      isActive ? "bg-alert" : "bg-alert"
                    } text-white`}
                  >
                    <Icon />
                  </span>
                  <span className="-mt-2">{label}</span>
                </>
              ) : (
                <>
                  <Icon />
                  {label === "Find a Doctor" ? "Doctor" : label}
                </>
              )
            }
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal">
        <BrandMark size={18} />
      </div>
      <span className="font-display text-lg font-semibold text-white">HavensLight</span>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3 11l9-7 9 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SosIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" strokeLinecap="round" />
      <circle cx="12" cy="16" r="0.6" fill="currentColor" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" strokeLinecap="round" />
      <path d="M16.5 4.6c1.6.5 2.8 2 2.8 3.8 0 1.8-1.2 3.3-2.8 3.8" strokeLinecap="round" />
      <path d="M20 20c0-3-1.7-5.2-4.3-5.9" strokeLinecap="round" />
    </svg>
  );
}
function StethoscopeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M5 3v6a4 4 0 008 0V3" strokeLinecap="round" />
      <path d="M9 13v2a5 5 0 0010 0v-2.5" strokeLinecap="round" />
      <circle cx="19.5" cy="10" r="1.6" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
