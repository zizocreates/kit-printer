// "Calm" means the visitor asked for reduced motion. MotionConfig handles motion/react animations for us, but a
// typing effect or a cycling timer is our own code, so it has to ask as well.
import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export function useCalm(): boolean {
  const [calm, setCalm] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(QUERY);
    const onChange = () => setCalm(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return calm;
}
