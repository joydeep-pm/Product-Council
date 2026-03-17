"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isRunning: boolean;
};

export function PromptComposer({ value, onChange, onSubmit, isRunning }: Props) {
  return (
    <section className="panel rounded-2xl p-5 shadow-panel">
      <div className="mb-3 text-sm uppercase tracking-[0.18em] text-fg1">Council Prompt</div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="w-full resize-y rounded-xl border border-white/10 bg-bg1 p-4 text-sm text-fg0 outline-none focus:border-accent"
        placeholder="Ask your strategy question..."
      />
      <div className="mt-4 flex items-center justify-end">
        <button
          onClick={onSubmit}
          disabled={isRunning || !value.trim()}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunning ? "Running Council..." : "Run Council"}
        </button>
      </div>
    </section>
  );
}
