"use client";

import { UserProfile } from "./types";

type NavbarProps = {
  user: UserProfile | null;
  onlineCount: number;
  onLogout: () => void;
};

export default function Navbar({ user, onlineCount, onLogout }: NavbarProps) {
  const handleLogout = () => {
    if (confirm("Kya pakka logout karna hai?")) {
      onLogout();
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              CC
            </div>
            <span className="text-sm text-slate-400">Campus Connect</span>
          </div>

          {/* Center: Online Users */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-slate-300">
              <span className="font-semibold text-cyan-400">{onlineCount}</span> online
            </span>
          </div>

          {/* Right: User Profile & Logout */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.college}</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 text-lg">
                {user.avatar}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Log out</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile: Online Users */}
        <div className="sm:hidden mt-2 flex items-center gap-2 text-xs">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-slate-300">
            <span className="font-semibold text-cyan-400">{onlineCount}</span> online
          </span>
        </div>
      </div>
    </nav>
  );
}
