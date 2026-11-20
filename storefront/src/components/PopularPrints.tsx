// One-tap prints, the way club stores sell "player" shirts next to the blank one. Tapping fills the boxes; the
// buyer can still edit. The names are the store's sample prints, checked by the same shared rules as anything typed.
const PRINTS = [
  { name: "RONALDO", number: "7" },
  { name: "MESSI", number: "10" },
  { name: "SALAH", number: "11" },
  { name: "SAKA", number: "7" },
];

export function PopularPrints({ onPick, current }: { onPick: (name: string, number: string) => void; current: string }) {
  return (
    <div className="-my-1 flex items-center gap-2 overflow-x-auto py-1 [scrollbar-width:none] sm:flex-wrap" role="group" aria-label="Popular prints">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Popular</span>
      {PRINTS.map((p) => {
        const label = `${p.name} ${p.number}`;
        const on = current === label;
        return (
          <button
            key={label}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(p.name, p.number)}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-pill border px-3.5 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.08em] transition-colors ${
              on ? "border-ink bg-ink text-paper" : "border-ink/15 hover:border-ink"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
