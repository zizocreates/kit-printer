// The name and number, drawn on the shirt at the SAME coordinates as the theme block (1000-unit box, Oswald 700),
// so the preview here, the theme preview and the printed kit all agree.
import { useLayoutEffect, useRef } from "react";
import { motion } from "motion/react";

export const NAME_WIDTH = 330;   // between the side seams; longer names are squeezed, the way kit printers do
const NUMBER_WIDTH = 420;

function useFit(text: string, width: number) {
  const ref = useRef<SVGTextElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.removeAttribute("textLength");
    el.removeAttribute("lengthAdjust");
    // getComputedTextLength isn't there in jsdom; the fit is a visual nicety, so skip it rather than throw.
    if (text && typeof el.getComputedTextLength === "function" && el.getComputedTextLength() > width) {
      el.setAttribute("textLength", String(width));
      el.setAttribute("lengthAdjust", "spacingAndGlyphs");
    }
  }, [text, width]);
  return ref;
}

export function PrintOverlay({ name, number, ink = "#ffffff", animate = true }: { name: string; number: string; ink?: string; animate?: boolean }) {
  const nameRef = useFit(name, NAME_WIDTH);
  const numberRef = useFit(number, NUMBER_WIDTH);
  const pop = animate
    ? { initial: { scale: 1.18, opacity: 0.4 }, animate: { scale: 1, opacity: 1 }, transition: { type: "spring" as const, stiffness: 420, damping: 24 } }
    : {};
  return (
    <svg viewBox="0 0 1000 1000" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
      <g fill={ink} style={{ fontFamily: "Oswald, 'Arial Narrow', Arial, sans-serif", fontWeight: 700 }}>
        <text ref={nameRef} x={500} y={292} textAnchor="middle" fontSize={60} letterSpacing={8} data-testid="print-name">
          {name}
        </text>
        <motion.text
          key={number || "empty"}
          ref={numberRef}
          x={500}
          y={640}
          textAnchor="middle"
          fontSize={300}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          data-testid="print-number"
          {...pop}
        >
          {number}
        </motion.text>
      </g>
    </svg>
  );
}
