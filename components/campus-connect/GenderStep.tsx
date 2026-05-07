import { MatchPreference } from "./types";

type GenderStepProps = {
  selected: MatchPreference | null;
  onSelect: (value: MatchPreference) => void;
  onContinue: () => void;
  onBack: () => void;
};

const options: Array<{ value: MatchPreference; label: string; hint: string }> = [
  { value: "male", label: "Ladke se baat karni hai", hint: "Boy match" },
  { value: "female", label: "Ladki se baat karni hai", hint: "Girl match" },
  { value: "any", label: "Koi bhi chalega", hint: "Random match" },
];

export default function GenderStep({ selected, onSelect, onContinue, onBack }: GenderStepProps) {
  return (
    <section className="glass-panel rounded-3xl border border-white/15 p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-white">K</h2>
      <p className="mt-2 text-sm text-slate-300">Gender choose karo, fir matching start hogi.</p>

      <div className="mt-6 space-y-3">
        {options.map((option) => {
          const active = selected === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                active
                  ? "border-cyan-300 bg-cyan-300/15"
                  : "border-white/15 bg-slate-900/60 hover:bg-slate-800/70"
              }`}
            >
              <p className="text-base font-semibold text-white">{option.label}</p>
              <p className="text-xs text-slate-300">{option.hint}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onBack}
          className="rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
        >
          Wapas
        </button>
        <button
          onClick={onContinue}
          disabled={!selected}
          className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Match Start Karo
        </button>
      </div>
    </section>
  );
}
