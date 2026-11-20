// A kit in a grid: lifts on hover, turns to the printed back, and slides up sizes for a one-tap add.
import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { useCart } from "../lib/cart";
import { format } from "../lib/money";
import type { Kit } from "../lib/types";
import { NoPhoto } from "./NoPhoto";
import { sized, srcSet } from "../lib/cdn";

const CARD_WIDTHS = [360, 540, 720, 960];
const CARD_SIZES = "(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 92vw";

/** `level`: the heading level of the kit title. 2 under a page h1 (the Kits page), 3 under a section h2 (Home). */
export function KitCard({ kit, priority = false, level = 2 }: { kit: Kit; priority?: boolean; level?: 2 | 3 }) {
  const H = level === 2 ? "h2" : "h3";
  const { add, setOpen, busy } = useCart();
  const [added, setAdded] = useState<string | null>(null);
  const front = kit.images[0];
  const back = kit.images[1];
  const href = `/kits/${kit.handle}`;

  async function quickAdd(variantId: string) {
    if (await add(variantId, 1, null)) {
      setAdded(variantId);
      setOpen(true);
      setTimeout(() => setAdded(null), 1600);
    }
  }

  return (
    <motion.article
      className="group relative"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-[#ececea] shadow-card transition-shadow duration-300 group-hover:shadow-lift">
        <Link to={href} viewTransition aria-label={kit.title} className="absolute inset-0 z-10" />
        {!front && <div className="absolute inset-0"><NoPhoto title={kit.title} /></div>}
        {front && (
          <img
            src={sized(front.url, 720)}
            srcSet={srcSet(front.url, CARD_WIDTHS) || undefined}
            sizes={CARD_SIZES}
            width={front.width}
            height={front.height}
            alt=""
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            className="absolute inset-0 size-full object-cover transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.03] group-hover:opacity-0"
            style={{ viewTransitionName: `kit-${kit.handle}` }}
          />
        )}
        {back && (
          <img
            src={sized(back.url, 720)}
            srcSet={srcSet(back.url, CARD_WIDTHS) || undefined}
            sizes={CARD_SIZES}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full scale-[1.03] object-cover opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:scale-100 group-hover:opacity-100"
          />
        )}
        {kit.printPrice && (
          <span className="eyebrow absolute left-4 top-4 z-20 rounded-pill bg-paper/90 px-3 py-1.5 text-[0.62rem] text-ink backdrop-blur">
            Add your name
          </span>
        )}
        {/* Quick add: sizes slide up on hover (and on keyboard focus). Phones go to the product page instead. */}
        <div className="absolute inset-x-3 bottom-3 z-20 hidden translate-y-4 rounded-[16px] bg-paper/95 p-3 opacity-0 shadow-card backdrop-blur transition-all duration-300 ease-[var(--ease-out-expo)] group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(pointer:fine)]:block">
          <p className="mb-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">Quick add, no print</p>
          <div className="flex justify-center gap-1.5">
            {kit.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={!v.availableForSale || busy}
                onClick={() => quickAdd(v.id)}
                aria-label={`Add ${kit.title}, size ${v.size}, to the bag`}
                className="h-9 min-w-10 rounded-pill border border-ink/15 px-2.5 text-xs font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:opacity-40"
              >
                {added === v.id ? "✓" : v.size}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div>
          <p className="eyebrow text-[0.65rem]">{kit.vendor}</p>
          <H className="mt-1 font-semibold leading-snug">
            <Link to={href} viewTransition className="hover:underline">
              {kit.title}
            </Link>
          </H>
        </div>
        <p className="shrink-0 text-sm font-semibold tabular-nums">
          <span className="font-normal text-muted">From </span>{format(kit.priceRange.min)}
        </p>
      </div>
    </motion.article>
  );
}
