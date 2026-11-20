// The big shirt on the product page. Front photo on one face, the blank back plus the live print on the other.
// It turns to the back by itself while the buyer types, like the big club shops do.
import { motion } from "motion/react";
import type { Kit } from "../lib/types";
import { PrintOverlay } from "./PrintOverlay";

type Props = { kit: Kit; side: "front" | "back"; onSide: (side: "front" | "back") => void; name: string; number: string };

export function KitStage({ kit, side, onSide, name, number }: Props) {
  const front = kit.images[0];
  const back = kit.backBlank;
  const sample = kit.images[1];
  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-card bg-[#ececea] [perspective:1800px]">
        <motion.div
          className="relative size-full [transform-style:preserve-3d]"
          animate={{ rotateY: side === "back" ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 20, mass: 0.9 }}
        >
          <Face>
            {front ? <img src={front.url} alt={front.altText ?? `Front of the ${kit.title}`} className="size-full object-cover" fetchPriority="high" style={{ viewTransitionName: `kit-${kit.handle}` }} /> : <DrawnShirt colour={kit.shirtColour} />}
          </Face>
          <Face back>
            {back ? (
              <img src={back.url} alt={back.altText ?? `Back of the ${kit.title}`} className="size-full object-cover" />
            ) : sample && !kit.printPrice ? (
              <img src={sample.url} alt={sample.altText ?? ""} className="size-full object-cover" />
            ) : (
              <DrawnShirt colour={kit.shirtColour} />
            )}
            {kit.printPrice && (
              <div className="absolute inset-0">
                <PrintOverlay name={name} number={number} ink={kit.printColour ?? "#ffffff"} />
              </div>
            )}
          </Face>
        </motion.div>
        <span className="eyebrow absolute left-5 top-5 rounded-pill bg-paper/80 px-3 py-1.5 text-[0.65rem] text-ink backdrop-blur">
          {side === "back" ? "Back, live preview" : "Front"}
        </span>
      </div>
      <div role="group" aria-label="Show side" className="flex justify-center gap-2">
        {(["front", "back"] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={side === s}
            onClick={() => onSide(s)}
            className={`h-9 rounded-pill px-5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${side === s ? "bg-ink text-paper" : "bg-sweep text-muted hover:text-ink"}`}
          >
            {s === "front" ? "Front" : "Back"}
          </button>
        ))}
      </div>
    </div>
  );
}

function Face({ back = false, children }: { back?: boolean; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 [backface-visibility:hidden]" style={back ? { transform: "rotateY(180deg)" } : undefined}>
      {children}
    </div>
  );
}

/** A plain shirt in the kit's colour, for a product with no photo of its back yet. */
export function DrawnShirt({ colour }: { colour: string | null }) {
  return (
    <svg viewBox="0 0 1000 1000" className="size-full" aria-hidden>
      <path
        d="M330 120 C380 150 440 165 500 165 C560 165 620 150 670 120 L860 220 L930 420 L800 470 L760 400 L760 900 L240 900 L240 400 L200 470 L70 420 L140 220 Z"
        fill={colour ?? "#d9d9d4"}
        stroke="rgb(0 0 0 / 0.12)"
        strokeWidth="4"
      />
    </svg>
  );
}
