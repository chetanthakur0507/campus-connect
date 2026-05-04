type LandingScreenProps = {
  onStart: () => void;
  onHowItWorks: () => void;
  onlineUsers: number;
};

const highlights = [
  {
    icon: "💬",
    title: "Anonymous Chat",
    text: "Real-time text messaging, koi identity nahi",
  },
  {
    icon: "📞",
    title: "Voice Call",
    text: "Baat karo — number share hoga hi nahi",
  },
  {
    icon: "📹",
    title: "Video Call",
    text: "Face-to-face, WebRTC encrypted connection",
  },
  {
    icon: "🎲",
    title: "Random Match",
    text: "College pool se random partner milega",
  },
  {
    icon: "🛡️",
    title: "Zero Data Stored",
    text: "Koi bhi message server pe save nahi hoga",
  },
  {
    icon: "🚪",
    title: "Instant Exit",
    text: "Ek click mein chat khatam, koi trace nahi",
  },
];

export default function LandingScreen({ onStart, onHowItWorks, onlineUsers }: LandingScreenProps) {
  return (
    <section className="glass-panel rounded-3xl border border-white/15 p-6 md:p-10">
      <div className="mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-100">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
          {onlineUsers.toLocaleString("en-IN")} users online in college pool
        </div>
        <h1 className="text-3xl font-bold leading-tight text-white md:text-5xl">
          Baat karo, bina koi pehchaan bataye
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm text-slate-200/90 md:text-lg">
          Anonymous text, voice aur video chat — sirf tumhare college ke andar. Koi number,
          koi naam, koi personal info share nahi hogi.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={onStart}
            className="w-full rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
          >
            Abhi Shuru Karo →
          </button>
          <button
            onClick={onHowItWorks}
            className="w-full rounded-2xl border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            Kaise kaam karta hai?
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
          >
            <p className="text-lg">{item.icon}</p>
            <h2 className="mt-2 text-base font-semibold text-white">{item.title}</h2>
            <p className="mt-1 text-sm text-slate-300">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
