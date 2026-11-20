// Size picker: a real radio group (arrow keys work, one tab stop), drawn as pills.
import type { Variant } from "../lib/types";

type Props = {
  variants: Variant[];
  value: string | null;
  onChange: (variantId: string) => void;
  name?: string;
  compact?: boolean;
  error?: boolean;
};

export function SizePills({ variants, value, onChange, name = "size", compact = false, error = false }: Props) {
  return (
    <div role="radiogroup" aria-label="Size" aria-invalid={error || undefined} className="flex flex-wrap gap-2">
      {variants.map((v) => {
        const checked = v.id === value;
        return (
          <label
            key={v.id}
            className={[
              "relative grid cursor-pointer place-items-center rounded-pill border font-semibold transition-all duration-200",
              compact ? "h-9 min-w-11 px-3 text-xs" : "h-12 min-w-14 px-4 text-sm",
              checked ? "border-ink bg-ink text-paper" : error ? "border-error/60 bg-paper hover:border-ink" : "border-ink/15 bg-paper hover:border-ink",
              v.availableForSale ? "" : "cursor-not-allowed text-muted line-through opacity-50",
            ].join(" ")}
          >
            <input
              type="radio"
              name={name}
              value={v.id}
              checked={checked}
              disabled={!v.availableForSale}
              onChange={() => onChange(v.id)}
              className="peer sr-only"
            />
            <span className="pointer-events-none absolute inset-0 rounded-pill peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink" />
            {v.size}
            {!v.availableForSale && <span className="sr-only"> (sold out)</span>}
          </label>
        );
      })}
    </div>
  );
}
