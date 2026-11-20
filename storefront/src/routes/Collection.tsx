// The Kits page: every kit, filterable by club, with the socks offered underneath.
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { useCollection, useKit } from "../lib/useData";
import { KitCard } from "../components/KitCard";
import { NoPhoto } from "../components/NoPhoto";
import { Button } from "../components/ui/Button";
import { format } from "../lib/money";
import type { Kit } from "../lib/types";
import { sized } from "../components/home/cdn";

const ALL = "All";

function KitSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-card bg-sweep" />
      <div className="mt-4 h-3 w-20 rounded-pill bg-sweep" />
      <div className="mt-2 h-4 w-40 rounded-pill bg-sweep" />
    </div>
  );
}

function SocksRow({ socks }: { socks: Kit }) {
  const variant = socks.variants[0];
  const image = socks.images[0];

  return (
    <section className="mt-20 border-t border-line pt-12">
      <p className="eyebrow">Add the socks</p>
      <div className="mt-5 grid grid-cols-1 items-center gap-6 rounded-card border border-line bg-paper p-5 shadow-card sm:grid-cols-[10rem_1fr_auto] sm:p-6">
        <Link
          to={`/kits/${socks.handle}`}
          viewTransition
          className="relative aspect-square w-full overflow-hidden rounded-field bg-sweep sm:w-40"
          aria-label={socks.title}
        >
          {image ? (
            <img
              src={sized(image.url, 320)}
              alt=""
              width={320}
              height={320}
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <NoPhoto title={socks.title} />
          )}
        </Link>
        <div>
          <p className="eyebrow text-[0.65rem]">{socks.vendor}</p>
          <h2 className="display mt-1.5 text-2xl">
            <Link to={`/kits/${socks.handle}`} viewTransition className="hover:underline">
              {socks.title}
            </Link>
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            Match socks to finish the kit. These cannot be printed, so there is no name and number box on their
            page, and the checkout would refuse a print on them anyway.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
          <p className="text-lg font-semibold tabular-nums">{format(socks.priceRange.min)}</p>
          <Button to={`/kits/${socks.handle}`} variant="outline" size="md">
            {variant?.availableForSale ? "View socks" : "Sold out"}
          </Button>
        </div>
      </div>
    </section>
  );
}

export function Collection() {
  const { data, loading, error } = useCollection("kits");
  const { data: socks } = useKit("football-socks");
  const [club, setClub] = useState<string>(ALL);

  useEffect(() => {
    document.title = "All kits · Kits by Zizo";
  }, []);

  const kits = data ?? [];
  const clubs = useMemo(() => {
    const names = Array.from(new Set(kits.map((k) => k.vendor).filter(Boolean)));
    names.sort((a, b) => a.localeCompare(b));
    return [ALL, ...names];
  }, [kits]);

  const shown = club === ALL ? kits : kits.filter((k) => k.vendor === club);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow">Season 26/27</p>
      <h1 className="display mt-3 text-5xl sm:text-6xl">All kits</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
        Four original kits for four made-up clubs. Every one can take a name and a number on the back, printed in
        the kit&apos;s own colours.
      </p>

      {clubs.length > 2 && (
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter kits by club">
          {clubs.map((name) => {
            const on = club === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setClub(name)}
                aria-pressed={on}
                className={`h-11 rounded-pill border px-4 text-sm font-semibold transition-colors ${
                  on ? "border-ink bg-ink text-paper" : "border-ink/15 bg-paper text-ink hover:border-ink"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-10 rounded-card border border-line bg-sweep p-6 text-sm text-muted">
          The kits did not load just now. Please refresh the page.
        </p>
      )}

      <p className="mt-8 text-sm text-muted" aria-live="polite">
        {loading && kits.length === 0 ? "Loading kits" : `${shown.length} ${shown.length === 1 ? "kit" : "kits"}`}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-busy={loading}>
        {loading && kits.length === 0 && [0, 1, 2, 3].map((i) => <KitSkeleton key={i} />)}
        {shown.map((kit, i) => (
          <motion.div
            key={kit.handle}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(i, 7) * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <KitCard kit={kit} priority={i < 2} />
          </motion.div>
        ))}
      </div>

      {!loading && !error && shown.length === 0 && (
        <p className="mt-10 rounded-card border border-line bg-sweep p-6 text-sm text-muted">
          No kits for {club} yet.{" "}
          <button type="button" onClick={() => setClub(ALL)} className="font-semibold text-ink underline underline-offset-4">
            Show all kits
          </button>
        </p>
      )}

      {socks && <SocksRow socks={socks} />}
    </div>
  );
}
