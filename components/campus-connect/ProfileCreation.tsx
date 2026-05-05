"use client";

import { FormEvent, useState } from "react";

type ProfileCreationProps = {
  onProfileCreated: (sessionId: string) => void;
};

const AVATARS = ["👨‍💻", "👨‍🎮", "🎨", "📸", "📚", "🎬", "🤖", "🎵", "⚡", "🚀"];

const INTERESTS = [
  "Coding",
  "Gaming",
  "Art",
  "Photography",
  "Books",
  "Music",
  "Finance",
  "Sports",
  "Dance",
  "AI/ML",
  "Travel",
  "Fashion",
  "Startup",
  "Psychology",
  "Anime",
  "Coffee",
];

export default function ProfileCreation({ onProfileCreated }: ProfileCreationProps) {
  const [step, setStep] = useState<"info" | "interests">("info");
  const [name, setName] = useState("");
  const [year, setYear] = useState<"1st" | "2nd" | "3rd" | "4th">("2nd");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleInfoSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name zaroori hai!");
      return;
    }
    setError("");
    setStep("interests");
  };

  const handleProfileCreate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Generate unique session ID
      const sessionId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          name,
          year,
          gender,
          avatar: selectedAvatar,
          interests: selectedInterests.slice(0, 5), // Max 5 interests
          college: "Delhi University",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Profile creation failed");
      }

      // Store sessionId in localStorage
      localStorage.setItem("cc_sessionId", sessionId);
      localStorage.setItem("cc_userProfile", JSON.stringify({ name, year, gender, avatar: selectedAvatar, interests: selectedInterests }));

      onProfileCreated(sessionId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#041025] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(14,165,233,0.36),transparent_35%),radial-gradient(circle_at_82%_18%,rgba(251,146,60,0.27),transparent_38%),radial-gradient(circle_at_52%_84%,rgba(20,184,166,0.3),transparent_40%)]" />

      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6 md:px-8 md:py-12 min-h-screen items-center justify-center">
        <div className="glass-panel rounded-3xl border border-white/15 p-8 w-full">
          <h1 className="text-4xl font-bold text-white mb-2">Campus Connect</h1>
          <p className="text-slate-300 mb-8">Pehle apna profile banao, phir matching start hogi!</p>

          {step === "info" ? (
            <form onSubmit={handleInfoSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Tera Naam? 👤
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Ananya, Rahul..."
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Year? 📚
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["1st", "2nd", "3rd", "4th"] as const).map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYear(y)}
                      className={`py-2 px-3 rounded-xl font-semibold transition ${
                        year === y
                          ? "bg-cyan-400 text-slate-950"
                          : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Gender? 👥
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`py-3 px-4 rounded-xl font-semibold transition ${
                      gender === "male"
                        ? "bg-cyan-400 text-slate-950"
                        : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    👨 Boy
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`py-3 px-4 rounded-xl font-semibold transition ${
                      gender === "female"
                        ? "bg-cyan-400 text-slate-950"
                        : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    👩 Girl
                  </button>
                </div>
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Avatar Choose Kar 😊
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`h-12 rounded-xl text-2xl transition border ${
                        selectedAvatar === avatar
                          ? "border-cyan-400 bg-cyan-400/20"
                          : "border-white/20 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-rose-300 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full rounded-xl bg-cyan-400 py-3 font-semibold text-slate-950 hover:bg-cyan-300 transition"
              >
                Aage Badhao →
              </button>
            </form>
          ) : (
            <form onSubmit={handleProfileCreate} className="space-y-6">
              <div>
                <p className="text-lg font-semibold text-white mb-2">
                  Hi {name}! 👋
                </p>
                <p className="text-slate-300 mb-4">
                  Apni interests choose kar (max 5). Isse matching better hogi!
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold transition ${
                      selectedInterests.includes(interest)
                        ? "bg-cyan-400 text-slate-950"
                        : "border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10"
                    } ${selectedInterests.length >= 5 && !selectedInterests.includes(interest) ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={selectedInterests.length >= 5 && !selectedInterests.includes(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <div className="text-sm text-slate-300">
                Selected: {selectedInterests.length}/5
              </div>

              {error && <p className="text-rose-300 text-sm">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("info")}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-white/20 bg-white/5 py-3 font-semibold text-white hover:bg-white/10 transition disabled:opacity-50"
                >
                  Wapas
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-cyan-400 py-3 font-semibold text-slate-950 hover:bg-cyan-300 transition disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Profile Banao & Shuru Karo! 🚀"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
