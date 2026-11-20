// How printing works, in three steps. The middle step is the point of the whole app, so it is a real live demo:
// the boxes run shared/print.js, the same rules file the checkout Function runs, and the shirt updates as you type.
import { useState } from "react";
import { Link } from "react-router";
import { PrintOverlay } from "../PrintOverlay";
import { check, NAME_MAX } from "../../lib/print";
import { sized } from "../../lib/cdn";
import { format } from "../../lib/money";
import type { Kit } from "../../lib/types";

function StepCard({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col rounded-card border border-line bg-paper p-6 shadow-card">
      <div className="flex items-center gap-3">
        <span className="display grid size-9 shrink-0 place-items-center rounded-pill bg-ink text-base text-paper">{n}</span>
        <h3 className="display text-xl">{title}</h3>
      </div>
      <div className="mt-4 flex grow flex-col text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}

function LiveDemo({ kit }: { kit: Kit | undefined }) {
  const [name, setName] = useState("RONALDO");
  const [number, setNumber] = useState("7");
  const result = check(name, number);
  const ink = kit?.printColour ?? "#ffffff";

  return (
    <div className="mt-4">
      <div className="relative mx-auto aspect-square w-full max-w-[13rem] overflow-hidden rounded-field bg-sweep">
        {kit?.backBlank && (
          // Drawn at most 208px wide, so ask the CDN for that rather than the 1600px original.
          <img
            src={sized(kit.backBlank.url, 416)}
            alt=""
            width={416}
            height={416}
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
          />
        )}
        <PrintOverlay name={result.name || name.toUpperCase()} number={result.number || number} ink={ink} animate />
      </div>
      <div className="mt-4 grid grid-cols-[1fr_4.5rem] gap-2">
        <label className="sr-only" htmlFor="demo-name">Try a name</label>
        <input
          id="demo-name"
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase().slice(0, NAME_MAX + 4))}
          placeholder="Your name"
          autoComplete="off"
          spellCheck={false}
          className="h-12 w-full rounded-field border border-ink/15 bg-paper px-3 font-[family-name:var(--font-display)] text-base uppercase tracking-[0.1em] outline-none transition-colors focus:border-ink"
        />
        <label className="sr-only" htmlFor="demo-number">Try a number</label>
        <input
          id="demo-number"
          value={number}
          onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
          placeholder="7"
          inputMode="numeric"
          autoComplete="off"
          className="h-12 w-full rounded-field border border-ink/15 bg-paper px-3 text-center font-[family-name:var(--font-display)] text-base outline-none transition-colors focus:border-ink"
        />
      </div>
      <p role="status" className="mt-2 min-h-5 text-xs font-medium">
        {result.ok ? (
          <span className="text-ok">That one can be printed.</span>
        ) : (
          <span className="text-error">{result.reason}</span>
        )}
      </p>
    </div>
  );
}

export function PrintingSteps({ kit, printPrice }: { kit: Kit | undefined; printPrice: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="eyebrow">How printing works</p>
      <h2 className="display mt-3 max-w-2xl text-4xl sm:text-5xl">Pick, print, priced by Shopify</h2>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
        The name and number are not a form bolted onto a theme. They are checked and priced inside Shopify&apos;s own
        checkout, so the rules hold even if someone skips this page entirely.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        <StepCard n={1} title="Pick your kit">
          <p>
            Four kits for the 26/27 season, in S, M, L and XL. Sizes are buttons you can see, never hidden in a
            dropdown.
          </p>
          <Link to="/kits" className="mt-auto pt-4 font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
            See the kits
          </Link>
        </StepCard>

        <StepCard n={2} title="Add your name">
          <p>
            Up to {NAME_MAX} characters and a number from 1 to 99. Try it: these boxes run the same rules file as the
            checkout.
          </p>
          <LiveDemo kit={kit} />
        </StepCard>

        <StepCard n={3} title="Priced by Shopify">
          <p>
            Printing adds {printPrice} to the shirt&apos;s own line, applied by a Shopify Function in the checkout. There
            is no separate printing item, so changing the quantity can never leave the charge behind.
          </p>
          <Link to="/how-its-built" className="mt-auto pt-4 font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
            How that works
          </Link>
        </StepCard>
      </div>
    </section>
  );
}

export function priceLabel(kit: Kit | undefined): string {
  return kit?.printPrice ? format(kit.printPrice) : "$15.00";
}
