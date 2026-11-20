// "No print" or "Personalize +$15.00".
import { format } from "../lib/money";
import type { Money } from "../lib/types";

export function PersonalizePills({ price, on, onChange }: { price: Money; on: boolean; onChange: (on: boolean) => void }) {
  const pill = (active: boolean) =>
    `flex h-12 flex-1 items-center justify-center gap-2 rounded-pill border px-4 text-sm font-semibold transition-all duration-200 ${
      active ? "border-ink bg-ink text-paper" : "border-ink/15 bg-paper hover:border-ink"
    }`;
  return (
    <div role="radiogroup" aria-label="Personalisation" className="flex gap-2">
      <button type="button" role="radio" aria-checked={!on} className={pill(!on)} onClick={() => onChange(false)}>
        No print
      </button>
      <button type="button" role="radio" aria-checked={on} className={pill(on)} onClick={() => onChange(true)}>
        Personalize <span className={on ? "text-paper/70" : "text-muted"}>+{format(price)}</span>
      </button>
    </div>
  );
}
