"use client";

import { UserProfile } from "./types";

type ActiveUsersPanelProps = {
  users: UserProfile[];
  onUserSelect?: (user: UserProfile) => void;
  onlineCount: number;
};

export default function ActiveUsersPanel({ users, onUserSelect, onlineCount }: ActiveUsersPanelProps) {
  const activeUsers = users.filter((u) => u.active);

  return (
    <section className="glass-panel rounded-3xl border border-white/15 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Campus Mein Active Users</h2>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          {activeUsers.length} of {onlineCount} online
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => !user.busy && onUserSelect?.(user)}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-4 transition ${
              user.busy
                ? "cursor-not-allowed opacity-60 bg-slate-900/50"
                : "cursor-pointer hover:border-cyan-400/50 hover:bg-slate-800/80"
            }`}
          >
            {/* Busy Badge */}
            {user.busy && (
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-400/50 px-2 py-1 text-xs font-semibold text-rose-200">
                <span className="inline-block h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                Busy
              </div>
            )}

            {/* Active Badge */}
            {!user.busy && (
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 px-2 py-1 text-xs font-semibold text-emerald-200">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </div>
            )}

            {/* Avatar */}
            <div className="mb-3 inline-block h-14 w-14 rounded-full bg-gradient-to-br from-cyan-400 to-orange-400 flex items-center justify-center text-2xl font-bold">
              {user.avatar}
            </div>

            {/* User Info */}
            <h3 className="font-semibold text-white">{user.name}</h3>
            <p className="text-xs text-slate-400">
              {user.year} Year • {user.college}
            </p>

            {/* Interests */}
            <div className="mt-3 flex flex-wrap gap-1">
              {user.interests.slice(0, 2).map((interest, idx) => (
                <span
                  key={idx}
                  className="text-xs rounded-full bg-white/10 px-2 py-1 text-slate-300"
                >
                  {interest}
                </span>
              ))}
            </div>

            {/* Typing Indicator */}
            {user.typingIndicator && (
              <div className="mt-3 text-xs text-cyan-300 flex items-center gap-1">
                <span>typing</span>
                <span className="flex gap-0.5">
                  <span className="inline-block h-1 w-1 rounded-full bg-cyan-400 animate-bounce" />
                  <span
                    className="inline-block h-1 w-1 rounded-full bg-cyan-400 animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <span
                    className="inline-block h-1 w-1 rounded-full bg-cyan-400 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </span>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>{user.gender === "male" ? "👨" : "👩"}</span>
              {!user.busy && <span className="text-cyan-300 group-hover:text-cyan-200">View Profile →</span>}
              {user.busy && <span className="text-rose-300">In Chat</span>}
            </div>
          </div>
        ))}
      </div>

      {activeUsers.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p>Koi bhi active user nahi. Thoda wait karo...</p>
        </div>
      )}
    </section>
  );
}
