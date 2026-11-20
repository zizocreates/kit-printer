// Sticky header: wordmark, nav, and the bag with a count that pops when something is added.
import { NavLink, Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "../lib/cart";
import { Logo } from "./Logo";

const nav = ({ isActive }: { isActive: boolean }) =>
  `relative py-1 text-sm font-medium transition-colors ${isActive ? "text-ink" : "text-muted hover:text-ink"}`;

export function Header() {
  const { cart, setOpen } = useCart();
  const count = cart?.totalQuantity ?? 0;
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to="/" aria-label="Kits by Zizo, home"><Logo /></Link>
        <nav aria-label="Main" className="flex items-center gap-5 sm:gap-8">
          <NavLink to="/kits" className={nav}>Kits</NavLink>
          <NavLink to="/how-its-built" className={nav}>
            <span className="hidden sm:inline">How it's built</span>
            <span className="sm:hidden">The build</span>
          </NavLink>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative -mr-2 grid size-10 place-items-center rounded-full transition-colors hover:bg-sweep"
            aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
          >
            <BagIcon />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 520, damping: 22 }}
                  className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[0.65rem] font-bold leading-5 text-accent-ink"
                  aria-hidden
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </nav>
      </div>
    </header>
  );
}

function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" />
    </svg>
  );
}
