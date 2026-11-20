// The product page. The shirt on the left turns to show your name as you type it; the price on the right is the
// same sum the Cart Transform makes, and the bag shows Shopify's own number once it's added.
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../lib/cart";
import { useCollection, useKit } from "../lib/useData";
import { add as addMoney, format } from "../lib/money";
import { check } from "../lib/print";
import type { Kit } from "../lib/types";
import { KitStage } from "../components/KitStage";
import { PrintOverlay } from "../components/PrintOverlay";
import { SizePills } from "../components/SizePills";
import { PersonalizePills } from "../components/PersonalizePills";
import { PrintFields } from "../components/PrintFields";
import { KitCard } from "../components/KitCard";
import { SizeGuide } from "../components/SizeGuide";
import { Button } from "../components/ui/Button";
import { NotFound } from "./NotFound";

export function Product() {
  const { handle = "" } = useParams();
  const { data: kit, loading, error } = useKit(handle);
  useEffect(() => { if (kit) document.title = `${kit.title} · Kits by Zizo`; }, [kit]);
  if (loading) return <ProductSkeleton />;
  if (error) return <LoadError />;
  if (!kit) return <NotFound />;
  return <ProductView key={kit.handle} kit={kit} />;
}

function ProductView({ kit }: { kit: Kit }) {
  const { add, busy, errors, setOpen } = useCart();
  const [variantId, setVariantId] = useState<string | null>(null);
  const [personal, setPersonal] = useState(false);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [side, setSide] = useState<"front" | "back">("front");
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState(false);

  const result = check(name, number);
  const printing = personal && !!kit.printPrice;
  const price = useMemo(() => {
    const base = kit.variants.find((v) => v.id === variantId)?.price ?? kit.priceRange.min;
    return printing && kit.printPrice ? addMoney(base, kit.printPrice) : base;
  }, [kit, variantId, printing]);

  const needSize = tried && !variantId;
  const emptyPrint = printing && !result.isPrint;
  const showFieldErrors = tried || (!result.ok && (name.length > 0 || number.length > 0));

  function choosePersonal(on: boolean) {
    setPersonal(on);
    setSide(on ? "back" : "front");
  }
  function typed(setter: (v: string) => void) {
    return (v: string) => { setter(v); setSide("back"); };
  }

  async function addToBag() {
    setTried(true);
    if (!variantId) return;
    if (printing && (!result.ok || !result.isPrint)) { setSide("back"); return; }
    const ok = await add(variantId, 1, printing ? { name: result.name, number: result.number } : null);
    if (ok) {
      setDone(true);
      setTimeout(() => setDone(false), 1800);
      // the bag opens itself from here
    }
  }

  useEffect(() => { if (done) setOpen(true); }, [done, setOpen]);

  const addLabel = busy ? "Adding…" : done ? "Added" : `Add to bag · ${format(price)}`;

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-6 sm:px-6 md:pt-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <KitStage kit={kit} side={side} onSide={setSide} name={printing ? result.name : ""} number={printing ? result.number : ""} />
        </div>

        <div className="space-y-7">
          <header>
            <p className="eyebrow">{kit.vendor}</p>
            <h1 className="display mt-3 text-4xl sm:text-5xl">{kit.title}</h1>
            <div className="mt-4 flex items-baseline gap-3">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={price.amount} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} className="text-2xl font-semibold tabular-nums" aria-live="polite">
                  {format(price)}
                </motion.span>
              </AnimatePresence>
              {printing && kit.printPrice && <span className="text-sm text-muted">includes {format(kit.printPrice)} print</span>}
            </div>
          </header>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold">Size {needSize && <span role="alert" className="ml-2 font-medium text-error">Pick a size first.</span>}</h2>
              <SizeGuide />
            </div>
            <SizePills variants={kit.variants} value={variantId} onChange={setVariantId} error={needSize} />
          </div>

          {kit.printPrice ? (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold">Name and number</h2>
              <PersonalizePills price={kit.printPrice} on={personal} onChange={choosePersonal} />
              <AnimatePresence initial={false}>
                {personal && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                    <div className="flex gap-4 pt-1">
                      {kit.backBlank && (
                        <div className="relative mt-7 size-24 shrink-0 overflow-hidden rounded-[14px] bg-[#ececea] lg:hidden" aria-hidden>
                          <img src={kit.backBlank.url} alt="" className="size-full object-cover" />
                          <PrintOverlay name={result.name} number={result.number} ink={kit.printColour ?? "#ffffff"} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                      <PrintFields
                        name={name}
                        number={number}
                        onName={typed(setName)}
                        onNumber={typed(setNumber)}
                        onFocusChange={(f) => f && setSide("back")}
                        result={emptyPrint && tried ? { ...result, ok: false, field: "name", reason: "Add a name or a number, or choose No print." } : result}
                        showErrors={showFieldErrors}
                        autoFocus
                      />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <p className="rounded-field bg-sweep px-4 py-3 text-sm text-muted">This one can't be printed, so there's no name and number.</p>
          )}

          <div className="hidden space-y-3 lg:block">
            <Button variant="accent" size="lg" className="w-full" onClick={addToBag} disabled={busy}>{addLabel}</Button>
            <CartErrors errors={errors} />
          </div>

          <ul className="grid grid-cols-3 gap-3 text-center text-xs text-muted">
            <li className="rounded-field bg-sweep px-2 py-3"><span className="block text-base">✓</span>Checked as you type</li>
            <li className="rounded-field bg-sweep px-2 py-3"><span className="block text-base">$</span>Priced by Shopify</li>
            <li className="rounded-field bg-sweep px-2 py-3"><span className="block text-base">↺</span>Same rules at checkout</li>
          </ul>

          {kit.descriptionHtml.trim() && <details className="group border-t border-line pt-5" open>
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
              Details <span className="transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="prose-sm mt-3 space-y-2 text-sm leading-relaxed text-muted" dangerouslySetInnerHTML={{ __html: kit.descriptionHtml }} />
          </details>}
          <details className="group border-t border-line pt-5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
              Print rules <span className="transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Up to 12 letters, plus spaces, hyphens, apostrophes and full stops (VAN DIJK, O'BRIEN). Numbers 1 to 99. These are the same rules Shopify's checkout runs, from one shared file, so nothing you're shown here can be refused later.
            </p>
          </details>
        </div>
      </section>

      {/* Phones: the add button stays in reach. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <CartErrors errors={errors} />
        <Button variant="accent" size="lg" className="w-full" onClick={addToBag} disabled={busy}>{addLabel}</Button>
      </div>

      <MoreKits not={kit.handle} />
    </>
  );
}

function CartErrors({ errors }: { errors: { code: string; message: string }[] }) {
  if (!errors.length) return null;
  return (
    <div role="alert" className="mb-2 rounded-field border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
      {errors.map((e) => <p key={e.code + e.message}>{e.message}</p>)}
    </div>
  );
}

function MoreKits({ not }: { not: string }) {
  const { data } = useCollection("kits");
  const others = (data ?? []).filter((k) => k.handle !== not).slice(0, 3);
  if (!others.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:pb-8">
      <h2 className="display mb-6 text-3xl">More kits</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((k) => <KitCard key={k.handle} kit={k} level={3} />)}
      </div>
    </section>
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-10 sm:px-6 lg:grid-cols-[1.45fr_1fr] lg:gap-14" aria-busy="true" aria-label="Loading">
      <div className="aspect-square animate-pulse rounded-card bg-sweep" />
      <div className="space-y-4">
        <div className="h-3 w-24 animate-pulse rounded bg-sweep" />
        <div className="h-12 w-4/5 animate-pulse rounded bg-sweep" />
        <div className="h-8 w-28 animate-pulse rounded bg-sweep" />
        <div className="h-12 w-full animate-pulse rounded-pill bg-sweep" />
      </div>
    </div>
  );
}

function LoadError() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="display text-4xl">We couldn't load this kit</h1>
      <p className="mt-3 text-muted">The store didn't answer. Check your connection and try again.</p>
      <Button className="mt-6" onClick={() => location.reload()}>Try again</Button>
    </div>
  );
}
