type HowItWorksSheetProps = {
  open: boolean;
  onClose: () => void;
};

const steps = [
  "1. Gender select karo",
  "2. Match hoga",
  "3. Connect hone ke baad chat/call/video UI open hoga",
];

export default function HowItWorksSheet({ open, onClose }: HowItWorksSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold text-white">Kaise kaam karta hai?</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-200">
          {steps.map((step) => (
            <p key={step} className="rounded-xl border border-white/10 bg-slate-800/70 px-4 py-3">
              {step}
            </p>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Theek Hai
        </button>
      </div>
    </div>
  );
}
