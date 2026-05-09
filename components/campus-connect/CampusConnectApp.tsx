"use client";

import { useEffect, useState } from "react";
import ChatWorkspace from "./ChatWorkspace";
import GenderStep from "./GenderStep";
import HowItWorksSheet from "./HowItWorksSheet";
import LandingScreen from "./LandingScreen";
import ActiveUsersPanel from "./ActiveUsersPanel";
import ProfileCreation from "./ProfileCreation";
import Navbar from "./Navbar";
import { MatchPreference, UserProfile } from "./types";

type Stage = "landing" | "gender" | "browse" | "matching" | "connected";

export default function CampusConnectApp() {
  const [stage, setStage] = useState<Stage>("landing");
  const [selectedGender, setSelectedGender] = useState<MatchPreference | null>(null);
  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [openHow, setOpenHow] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user already has a profile on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem("cc_sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
      // Mark user as active and fetch profile
      updateUserStatus(storedSessionId, true);
      fetchUserProfile(storedSessionId);
    }
    setLoading(false);
  }, []);

  // Fetch current user profile
  const fetchUserProfile = async (sid: string) => {
    try {
      const response = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid }),
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  // Update user status on the server
  const updateUserStatus = async (sid: string, active: boolean) => {
    try {
      await fetch("/api/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, active }),
      });
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  // Fetch online users from database
  const fetchOnlineUsers = async () => {
    try {
      const response = await fetch("/api/users/online");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setOnlineUsers(data.count);
      }
    } catch (err) {
      console.error("Failed to fetch online users:", err);
    }
  };

  // Fetch users on component mount and periodically
  useEffect(() => {
    if (!sessionId) return;

    fetchOnlineUsers();

    const interval = setInterval(() => {
      fetchOnlineUsers();
    }, 3000); // Fetch every 3 seconds

    return () => clearInterval(interval);
  }, [sessionId]);

  // Mark user as offline on page unload
  useEffect(() => {
    if (!sessionId) return;

    const handleBeforeUnload = () => {
      navigator.sendBeacon("/api/users/status", JSON.stringify({ sessionId, active: false }));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sessionId]);

  // Real matching logic - match only from active users based on preference
  const matchUser = () => {
    if (users.length === 0) {
      alert("Koi active user nahi hai. Baad mein try karo!");
      return;
    }

    let filtered = users;

    // Filter by gender preference
    if (selectedGender === "male") {
      filtered = filtered.filter((u) => u.gender === "male");
    } else if (selectedGender === "female") {
      filtered = filtered.filter((u) => u.gender === "female");
    }

    if (filtered.length === 0) {
      alert(`Aapke preference ke andar koi active user nahi. Try 'any' preference!`);
      return;
    }

    // Pick random user from filtered list
    const matched = filtered[Math.floor(Math.random() * filtered.length)];
    setPartner(matched);
    setStage("matching");

    // Simulate matching animation then connect
    setTimeout(() => {
      setStage("connected");
    }, 2000);
  };

  const resetFlow = async () => {
    setStage("landing");
    setSelectedGender(null);
    setPartner(null);
    if (sessionId) {
      await updateUserStatus(sessionId, true);
    }
  };

  const handleLogout = async () => {
    if (sessionId) {
      // Mark user as offline
      await updateUserStatus(sessionId, false);
    }
    // Clear session from localStorage
    localStorage.removeItem("cc_sessionId");
    // Reset all state
    setSessionId(null);
    setCurrentUser(null);
    setStage("landing");
    setSelectedGender(null);
    setPartner(null);
    setUsers([]);
  };

  const handleProfileCreated = (newSessionId: string) => {
    setSessionId(newSessionId);
    fetchUserProfile(newSessionId);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#041025] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show profile creation if no session
  if (!sessionId) {
    return <ProfileCreation onProfileCreated={handleProfileCreated} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#041025] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(14,165,233,0.36),transparent_35%),radial-gradient(circle_at_82%_18%,rgba(251,146,60,0.27),transparent_38%),radial-gradient(circle_at_52%_84%,rgba(20,184,166,0.3),transparent_40%)]" />

      {/* Navbar */}
      <Navbar user={currentUser} onlineCount={onlineUsers} onLogout={handleLogout} />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 md:px-8 md:py-8">
        {stage === "landing" && (
          <LandingScreen
            onStart={() => setStage("gender")}
            onHowItWorks={() => setOpenHow(true)}
            onlineUsers={onlineUsers}
          />
        )}

        {stage === "gender" && (
          <GenderStep
            selected={selectedGender}
            onSelect={setSelectedGender}
            onBack={resetFlow}
            onContinue={() => setStage("browse")}
          />
        )}

        {stage === "browse" && (
          <>
            <ActiveUsersPanel
              users={users}
              onlineCount={onlineUsers}
              onUserSelect={(user) => {
                setPartner(user);
                setStage("matching");
                setTimeout(() => {
                  setStage("connected");
                }, 2000);
              }}
            />

            {/* Direct Match Button */}
            <div className="flex justify-center">
              <button
                onClick={matchUser}
                className="rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 px-8 py-3 font-semibold text-slate-950 transition hover:from-cyan-300 hover:to-cyan-400"
              >
                Random Match Connect Karo 🎲
              </button>
            </div>
          </>
        )}

        {stage === "matching" && partner && (
          <section className="glass-panel flex min-h-[480px] flex-col items-center justify-center gap-5 rounded-3xl border border-white/15 p-6 text-center">
            <div className="h-20 w-20 animate-pulse rounded-full bg-gradient-to-br from-cyan-400 to-orange-400 flex items-center justify-center text-4xl">
              {partner.avatar}
            </div>
            <h2 className="text-2xl font-semibold text-white">Connecting with {partner.name}...</h2>
            <p className="max-w-lg text-sm text-slate-300">
              {partner.year} Year • {partner.college}
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              {partner.interests.map((int, idx) => (
                <span key={idx} className="text-xs bg-cyan-400/20 px-3 py-1 rounded-full text-cyan-200">
                  {int}
                </span>
              ))}
            </div>
            <button
              onClick={resetFlow}
              className="mt-4 rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
            >
              Cancel
            </button>
          </section>
        )}

        {stage === "connected" && partner && sessionId && <ChatWorkspace partner={partner} onExit={resetFlow} userSessionId={sessionId} />}
      </main>

      <HowItWorksSheet open={openHow} onClose={() => setOpenHow(false)} />
    </div>
  );
}
