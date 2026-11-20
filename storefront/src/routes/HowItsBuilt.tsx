// How the store works. An interactive map of the request path, a live
// run of the shared print rules, and the bugs worth telling.
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { check, NAME_MAX } from "../lib/print";
import { API_VERSION, MODE, REPO_URL } from "../lib/config";
import { Button } from "../components/ui/Button";

type Step = { id: string; tag: string; title: string; where: string; body: string; code: string };

const STEPS: Step[] = [
  {
    id: "site", tag: "01", title: "This site", where: "React 19 · Vite · Cloudflare Pages",
    body: "A custom storefront, not a theme. Products come from Shopify's Storefront API into one typed contract, and the shirt preview draws your name at the exact coordinates the printed kit uses.",
    code: `const kit = await getKit("kanata-fc-away-kit");\n// printPrice, backBlank, printColour come from\n// kit_printer.* metafields (Storefront read access)`,
  },
  {
    id: "cart", tag: "02", title: "Storefront cart", where: `Storefront API ${API_VERSION}`,
    body: "Adding to the bag is a cartLinesAdd with two line attributes. Nothing about price is sent from the browser: the site only says what to print.",
    code: `cartLinesAdd(cartId, lines: [{\n  merchandiseId, quantity: 1,\n  attributes: [\n    { key: "Print name", value: "RONALDO" },\n    { key: "Print number", value: "7" } ] }])`,
  },
  {
    id: "price", tag: "03", title: "Cart Transform", where: "Shopify Function · kit-printer-price",
    body: "Runs inside Shopify on every cart change. A printed line gets a fixed price of kit plus print, in whole cents, so $89.99 + $15.00 is exactly $104.99.",
    code: `operations: [{ lineUpdate: {\n  cartLineId,\n  price: { adjustment: { fixedPricePerUnit:\n    { amount: "104.99" } } } } }]`,
  },
  {
    id: "check", tag: "04", title: "Cart Validation", where: "Shopify Function · kit-printer-check",
    body: "Refuses a print the rules don't allow, in the cart and again at checkout. The bag shows its message word for word, so the site never has its own version of the rules.",
    code: `validationAdd: { errors: [{\n  message: "Numbers go from 1 to 99.",\n  target: "$.cart" }] }`,
  },
  {
    id: "checkout", tag: "05", title: "Shopify Checkout", where: "checkoutUrl",
    body: "The buyer pays on Shopify's own checkout. Both Functions run there too, so the price can't be edited on the way and a bad print can't slip through.",
    code: `window.location.assign(cart.checkoutUrl)`,
  },
];

export function HowItsBuilt() {
  const [active, setActive] = useState(STEPS[0].id);
  useEffect(() => { document.title = "How it's built · Kits by Zizo"; }, []);
  const step = STEPS.find((s) => s.id === active)!;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <header className="max-w-3xl pb-10 pt-12 md:pt-20">
        <p className="eyebrow">How it's built</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">A storefront from scratch, priced inside Shopify</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          Kit Printer is a Shopify app that sells football kits with a printed name and number. This store is its custom front end: my own React site on the Storefront API, with the price and the checks done by the app's two Shopify Functions.
        </p>
      </header>

      {/* The request path. Pick a step to see what happens there. */}
      <section aria-labelledby="path" className="rounded-[28px] bg-ink p-5 text-paper sm:p-8 md:p-10">
        <h2 id="path" className="eyebrow !text-paper/60">One add to bag, start to finish</h2>
        <ol className="mt-6 grid gap-2 md:grid-cols-5 md:gap-0">
          {STEPS.map((s, i) => {
            const on = s.id === active;
            return (
              <li key={s.id} className="relative md:flex md:items-stretch">
                <button
                  type="button"
                  onClick={() => setActive(s.id)}
                  aria-pressed={on}
                  className={`relative h-full w-full rounded-[18px] px-4 py-4 text-left transition-colors md:mr-3 ${on ? "bg-paper text-ink" : "bg-paper/[0.06] hover:bg-paper/[0.12]"}`}
                >
                  <span className={`font-mono text-xs ${on ? "text-accent" : "text-paper/50"}`}>{s.tag}</span>
                  <span className="display mt-1 block text-xl">{s.title}</span>
                  <span className={`mt-1 block text-xs ${on ? "text-muted" : "text-paper/50"}`}>{s.where}</span>
                </button>
                {i < STEPS.length - 1 && <Flow />}
              </li>
            );
          })}
        </ol>
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mt-6 grid gap-6 rounded-[20px] bg-paper/[0.05] p-5 md:grid-cols-2 md:p-7"
          >
            <p className="text-base leading-relaxed text-paper/85">{step.body}</p>
            <pre className="overflow-x-auto rounded-[14px] bg-black/50 p-4 text-[0.8rem] leading-relaxed text-[#e9e6dc]"><code>{step.code}</code></pre>
          </motion.div>
        </AnimatePresence>
        <p className="mt-6 text-sm text-paper/60">
          One file, <code className="text-paper">shared/print.js</code>, holds the print rules. Both Functions import it, the theme block imports it, and so does this site. The check you see as you type is the same code that runs at checkout.
        </p>
      </section>

      <RulesPlayground />

      <section aria-labelledby="broke" className="py-16">
        <p className="eyebrow">What broke</p>
        <h2 id="broke" className="display mt-3 text-4xl">The bugs are the interesting part</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Bug title="The name never reached the cart">
            Shopify's add-to-cart form has a hidden field named <code>id</code>, and in a browser a field's name shadows the form's own property. So <code>form.id</code> was that field, and the name boxes pointed at no form. Fixed with <code>getAttribute("id")</code>; a test fails if <code>form.id</code> comes back.
          </Bug>
          <Bug title="The deploy refused a font">
            Theme app extensions only accept a short list of file types, and <code>.woff2</code> isn't on it. Every test passed and the deploy failed. The font now ships inside the CSS, and a test lists the block's files so the next one fails before a deploy.
          </Bug>
          <Bug title="The block vanished after the release">
            The theme editor had offered the dev copy of the block, and cleaning up dev mode deleted it. Lesson kept: test the released version alone, with dev mode off, before calling anything done.
          </Bug>
          <Bug title="Checkout on a test store">
            Every development store is password locked, and that lock covers checkout too. Worse, unlocking sends you to the store's home page, not back to your checkout. So the bag splits it in two: unlock in a new tab, then continue to checkout from here.
          </Bug>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href={REPO_URL} target="_blank" rel="noreferrer" size="lg">Read the source</Button>
          <Button to="/kits/kanata-fc-away-kit" variant="outline" size="lg">Try it on a kit</Button>
        </div>
      </section>
    </div>
  );
}

function Flow() {
  return (
    <span aria-hidden className="pointer-events-none absolute -right-1.5 top-1/2 z-10 hidden h-0.5 w-3 -translate-y-1/2 overflow-hidden bg-paper/20 md:block">
      <motion.span
        className="absolute inset-y-0 left-0 w-1.5 bg-accent"
        animate={{ x: [-6, 12] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
      />
    </span>
  );
}

function Bug({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-card border border-line p-6 [&_code]:rounded [&_code]:bg-sweep [&_code]:px-1 [&_code]:text-[0.85em]">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{children}</p>
    </article>
  );
}

// The shared rules, live. Type anything and see what the Cart Validation Function would say.
function RulesPlayground() {
  const [name, setName] = useState("o'brien");
  const [number, setNumber] = useState("100");
  const r = check(name, number);
  return (
    <section aria-labelledby="rules" className="grid gap-8 py-16 md:grid-cols-2 md:items-center">
      <div>
        <p className="eyebrow">Try the rules</p>
        <h2 id="rules" className="display mt-3 text-4xl">The same check as checkout</h2>
        <p className="mt-4 leading-relaxed text-muted">
          This runs <code className="rounded bg-sweep px-1">checkPrint()</code> from <code className="rounded bg-sweep px-1">shared/print.js</code> in your browser{MODE === "demo" ? ", and in demo mode the bag runs both Functions here too" : ""}. Up to {NAME_MAX} letters; numbers 1 to 99.
        </p>
      </div>
      <div className="min-w-0 rounded-card bg-sweep p-6">
        {/* minmax(0,1fr): a bare 1fr cannot shrink past the input&apos;s intrinsic width, which pushed this card 3px wider than a 360px screen. */}
        <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3">
          <label className="text-sm font-semibold">Name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-12 w-full rounded-field border border-ink/15 bg-paper px-3 font-normal outline-none focus:border-ink" />
          </label>
          <label className="text-sm font-semibold">Number
            <input value={number} onChange={(e) => setNumber(e.target.value)} className="mt-1.5 h-12 w-full rounded-field border border-ink/15 bg-paper px-3 text-center font-normal outline-none focus:border-ink" />
          </label>
        </div>
        <pre className="mt-4 overflow-x-auto rounded-[14px] bg-ink p-4 text-[0.8rem] leading-relaxed text-[#e9e6dc]" aria-live="polite"><code>{JSON.stringify(r, null, 2)}</code></pre>
        <p className={`mt-3 text-sm font-semibold ${r.ok ? "text-ok" : "text-error"}`}>
          {r.ok ? (r.isPrint ? `Allowed: prints as ${[r.name, r.number].filter(Boolean).join(" ")}` : "No print on this line") : `Refused: ${r.reason}`}
        </p>
      </div>
    </section>
  );
}
