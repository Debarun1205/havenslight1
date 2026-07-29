import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BrandMark from "../ui/BrandMark";

export default function PublicLayout({ children }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-sand">
      <header className="border-b border-ink/10 bg-white/70 px-4 py-4 backdrop-blur-sm sm:px-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal">
              <BrandMark size={18} />
            </div>
            <span className="font-display text-lg font-semibold text-ink">HavensLight</span>
          </Link>
          <Link
            to={user ? "/" : "/login"}
            className="text-sm font-semibold text-teal-deep hover:underline"
          >
            {user ? "Go to dashboard" : "Log in"}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-10">{children}</main>
    </div>
  );
}
