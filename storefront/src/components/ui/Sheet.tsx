// A modal layer: drawer from the right, or a centred dialog. Esc and the backdrop close it, focus moves in on open
// and back to where it was on close, Tab stays inside, and the page behind doesn't scroll.
import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

type Props = { open: boolean; onClose: () => void; label: string; side?: "right" | "center"; children: ReactNode };

export function Sheet({ open, onClose, label, side = "right", children }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>("[data-autofocus], button, a[href], input")?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); closeRef.current(); }
      if (e.key === "Tab" && panel.current) {
        const items = [...panel.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled])")];
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      before?.focus?.();
    };
  }, [open]);

  const right = side === "right";
  return (
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 z-50 flex ${right ? "justify-end" : "items-end justify-center sm:items-center"}`}>
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={right
              ? "relative flex h-full w-full max-w-md flex-col bg-paper shadow-lift"
              : "relative w-full max-w-md rounded-t-[24px] bg-paper p-6 shadow-lift sm:rounded-[24px] sm:p-8"}
            initial={right ? { x: "100%" } : { y: 40, opacity: 0 }}
            animate={right ? { x: 0 } : { y: 0, opacity: 1 }}
            exit={right ? { x: "100%" } : { y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function CloseButton({ onClick, label = "Close" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-sweep">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  );
}
