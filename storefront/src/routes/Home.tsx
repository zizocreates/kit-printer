// Home. The hero prints a name onto a kit back as you watch, then the kits, then how the printing is priced,
// then the teaser for how the whole thing is built.
import { useEffect, useRef } from "react";
import { preconnect, preload } from "react-dom";
import { motion, useScroll, useTransform } from "motion/react";
import { useCollection } from "../lib/useData";
import { KitCard } from "../components/KitCard";
import { Button } from "../components/ui/Button";
import { HeroPrint, HERO_SIZES, HERO_WIDTHS } from "../components/home/HeroPrint";
import { sized, srcSet } from "../lib/cdn";
import { PrintingSteps, priceLabel } from "../components/home/PrintingSteps";
import { BuiltTeaser } from "../components/home/BuiltTeaser";
import { useCalm } from "../components/home/useCalm";

function KitSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-card bg-sweep" />
      <div className="mt-4 h-3 w-20 rounded-pill bg-sweep" />
      <div className="mt-2 h-4 w-40 rounded-pill bg-sweep" />
    </div>
  );
}

export function Home() {
  const { data, loading, error } = useCollection("kits");
  const calm = useCalm();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Kits by Zizo: your name on your kit";
  }, []);

  // Scroll parallax on the hero kit. Transform only, and switched off for reduced motion.
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const lift = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const kits = data ?? [];
  const hero = kits.find((k) => k.backBlank) ?? kits[0];
  const printable = kits.find((k) => k.printPrice);

  // The hero image is the LCP. The kit shots come from Shopify's CDN, so open that connection early and start
  // fetching the hero as soon as we know which kit it is, instead of waiting for the <img> to be laid out.
  preconnect("https://cdn.shopify.com");
  if (hero?.backBlank) {
    const set = srcSet(hero.backBlank.url, HERO_WIDTHS);
    preload(sized(hero.backBlank.url, 800), {
      as: "image",
      fetchPriority: "high",
      ...(set ? { imageSrcSet: set, imageSizes: HERO_SIZES } : {}),
    });
  }

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pb-16 sm:pt-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="eyebrow">Season 26/27</p>
            <h1 className="display mt-4 text-[clamp(2.75rem,12vw,5.5rem)]">
              Your name.
              <br />
              Your number.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              Printed on the back of your kit, checked and priced inside Shopify&apos;s own checkout. Four kits,
              four made-up clubs, {priceLabel(printable)} for the printing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/kits" variant="accent" size="lg">
                Shop kits
              </Button>
              <Button to={printable ? `/kits/${printable.handle}` : "/kits"} variant="outline" size="lg">
                Add your name
              </Button>
            </div>
          </div>
          <motion.div style={calm ? undefined : { y: lift }} className="mx-auto w-full max-w-lg lg:max-w-none">
            <HeroPrint kit={hero} />
          </motion.div>
        </div>
      </section>

      {/* The kits */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The 26/27 kits</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">Four clubs, one printer</h2>
          </div>
          <Button to="/kits" variant="ghost" size="md">
            See all kits
          </Button>
        </div>

        {error && (
          <p role="alert" className="mt-10 rounded-card border border-line bg-sweep p-6 text-sm text-muted">
            The kits did not load just now. Please refresh the page.
          </p>
        )}

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-busy={loading}>
          {loading && kits.length === 0 && [0, 1, 2, 3].map((i) => <KitSkeleton key={i} />)}
          {kits.map((kit, i) => (
            // This grid sits under the section h2, so the card titles are h3.
            <KitCard key={kit.handle} kit={kit} priority={i < 2} level={3} />
          ))}
        </div>

        {!loading && !error && kits.length === 0 && (
          <p className="mt-10 rounded-card border border-line bg-sweep p-6 text-sm text-muted">
            No kits are published yet.
          </p>
        )}
      </section>

      <div className="bg-sweep/60">
        <PrintingSteps kit={hero} printPrice={priceLabel(printable)} />
      </div>

      <BuiltTeaser />
    </>
  );
}
