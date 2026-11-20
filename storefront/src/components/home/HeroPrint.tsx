// The hero kit: a blank shirt back with a name and number typing themselves on, cycling through four prints.
// It reuses PrintOverlay, so the letters sit at exactly the coordinates the theme block and the real print use.
import { useEffect, useState } from "react";
import { PrintOverlay } from "../PrintOverlay";
import { NoPhoto } from "../NoPhoto";
import type { Kit } from "../../lib/types";
import { useCalm } from "./useCalm";
import { sized, srcSet } from "../../lib/cdn";

// The hero is the page's largest image, so it is the LCP. It is drawn about 380px wide on a phone and about
// 560px in the two column layout, hence these widths rather than the 1600px original.
export const HERO_WIDTHS = [400, 600, 800, 1120];
export const HERO_SIZES = "(min-width: 1024px) 560px, calc(100vw - 2rem)";

const PRINTS = [
  { name: "RONALDO", number: "7" },
  { name: "MESSI", number: "10" },
  { name: "SALAH", number: "11" },
  { name: "SAKA", number: "7" },
];

const LETTER_MS = 90;
const NUMBER_PAUSE_MS = 180;
const HOLD_MS = 2600;

export function HeroPrint({ kit }: { kit: Kit | undefined }) {
  const calm = useCalm();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [showNumber, setShowNumber] = useState(false);

  const print = PRINTS[index];

  useEffect(() => {
    // Reduced motion: no typing and no cycling. Show one finished print and leave it alone.
    if (calm) {
      setTyped(PRINTS[0].name);
      setShowNumber(true);
      return;
    }
    const target = PRINTS[index].name;
    const timers: number[] = [];
    setTyped("");
    setShowNumber(false);
    for (let n = 0; n < target.length; n++) {
      timers.push(window.setTimeout(() => setTyped(target.slice(0, n + 1)), LETTER_MS * (n + 1)));
    }
    const typedFor = LETTER_MS * target.length;
    timers.push(window.setTimeout(() => setShowNumber(true), typedFor + NUMBER_PAUSE_MS));
    timers.push(window.setTimeout(() => setIndex((v) => (v + 1) % PRINTS.length), typedFor + HOLD_MS));
    return () => timers.forEach(clearTimeout);
  }, [index, calm]);

  const shown = calm ? PRINTS[0] : print;

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-card bg-sweep shadow-card">
      {kit?.backBlank ? (
        <img
          src={sized(kit.backBlank.url, 800)}
          srcSet={srcSet(kit.backBlank.url, HERO_WIDTHS) || undefined}
          sizes={HERO_SIZES}
          alt={`The back of the ${kit.title}, blank and ready to print`}
          width={kit.backBlank.width}
          height={kit.backBlank.height}
          className="absolute inset-0 size-full object-cover"
          fetchPriority="high"
        />
      ) : (
        <div className="absolute inset-0">
          <NoPhoto title={kit?.title ?? "Kit"} />
        </div>
      )}
      {kit?.backBlank && (
        <PrintOverlay
          name={typed}
          number={showNumber ? shown.number : ""}
          ink={kit.printColour ?? "#ffffff"}
          animate={!calm}
        />
      )}
      {/* The print being typed is decoration, but a screen reader should still know what it says. */}
      <p className="sr-only" aria-live="polite">
        {showNumber ? `${shown.name} ${shown.number} printed on the back` : ""}
      </p>
    </div>
  );
}
