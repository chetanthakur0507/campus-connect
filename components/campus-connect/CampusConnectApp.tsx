"use client";

import { useEffect, useState } from "react";
import ChatWorkspace from "./ChatWorkspace";
import GenderStep from "./GenderStep";
import HowItWorksSheet from "./HowItWorksSheet";
import LandingScreen from "./LandingScreen";
import { MatchPreference } from "./types";

type Stage = "landing" | "gender" | "matching" | "connected";

const partners = ["CampusWave", "NightOwl", "EchoSoul", "OrbitMind", "BlueNova", "ZenPixel"];

export default function CampusConnectApp() {
  const [stage, setStage] = useState<Stage>("landing");
  const [selectedGender, setSelectedGender] = useState<MatchPreference | null>(null);
  const [partner, setPartner] = useState("Anonymous#000");
  const [openHow, setOpenHow] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(482);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setOnlineUsers((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4;
        return Math.max(120, prev + delta);
      });
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (stage !== "matching") {
      return;
    }

    const timer = window.setTimeout(() => {
      const selected = partners[Math.floor(Math.random() * partners.length)];
      setPartner(selected);
      setStage("connected");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [stage]);

  const resetFlow = () => {
    setStage("landing");
    setSelectedGender(null);
    setPartner("Anonymous#000");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#041025] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(14,165,233,0.36),transparent_35%),radial-gradient(circle_at_82%_18%,rgba(251,146,60,0.27),transparent_38%),radial-gradient(circle_at_52%_84%,rgba(20,184,166,0.3),transparent_40%)]" />

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
            onContinue={() => setStage("matching")}
          />
        )}

        {stage === "matching" && (
          <section className="glass-panel flex min-h-[480px] flex-col items-center justify-center gap-5 rounded-3xl border border-white/15 p-6 text-center">
            <div className="h-20 w-20 animate-pulse rounded-full bg-gradient-to-br from-cyan-400 to-orange-400" />
            <h2 className="text-2xl font-semibold text-white">Mat progress...</h2>
            <p className="max-w-lg text-sm text-slate-300">
              {selectedGender === "male" && "Boy preference selected. Suitable partner dhundh rahe hain."}
              {selectedGender === "female" && "Girl preference selected. Suitable partner dhundh rahe hain."}
              {selectedGender === "any" && "Random preference selected. Fastest available partner connect hoga."}
            </p>
            <button
              onClick={resetFlow}
              className="rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
            >
              Cancel
            </button>
          </section>
        )}

        {stage === "connected" && <ChatWorkspace partner={partner} onExit={resetFlow} />}
      </main>

      <HowItWorksSheet open={openHow} onClose={() => setOpenHow(false)} />
    </div>
  );
}
