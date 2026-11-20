// The size guide sheet, as every kit shop has one. Body measurements, not the shirt's.
import { useState } from "react";
import { CloseButton, Sheet } from "./ui/Sheet";

const ROWS = [
  ["S", "88 to 96", "34.5 to 38", "173 to 178"],
  ["M", "96 to 104", "38 to 41", "178 to 183"],
  ["L", "104 to 112", "41 to 44", "183 to 188"],
  ["XL", "112 to 124", "44 to 49", "188 to 193"],
];

export function SizeGuide() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="-my-3 inline-flex min-h-11 items-center text-sm text-muted underline underline-offset-4 hover:text-ink">
        Size guide
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} label="Size guide" side="center">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Fit</p>
            <h2 className="display mt-2 text-3xl">Size guide</h2>
          </div>
          <CloseButton onClick={() => setOpen(false)} />
        </div>
        <p className="text-sm text-muted">A regular, stadium fit. Measure your chest at the widest point. Between sizes? Size up.</p>
        <table className="mt-5 w-full text-left text-sm tabular-nums">
          <thead className="text-xs uppercase tracking-[0.1em] text-muted">
            <tr><th className="py-2 font-semibold">Size</th><th className="font-semibold">Chest cm</th><th className="font-semibold">Chest in</th><th className="font-semibold">Height cm</th></tr>
          </thead>
          <tbody className="divide-y divide-line border-t border-line">
            {ROWS.map(([s, cm, inch, h]) => (
              <tr key={s}><th scope="row" className="py-3 font-semibold">{s}</th><td>{cm}</td><td>{inch}</td><td>{h}</td></tr>
            ))}
          </tbody>
        </table>
      </Sheet>
    </>
  );
}
