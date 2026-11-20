// A teaser for the How it's built page: this storefront is custom code, and the rules still cannot be skipped, because they
// live in checkout. The full version is the How it's built page.
import { Button } from "../ui/Button";

const PIECES = [
  { label: "This site", detail: "React on the Storefront API. No theme, no server of mine." },
  { label: "The check", detail: "A Validation Function refuses a print that cannot be made." },
  { label: "The price", detail: "A Cart Transform Function adds the printing to the shirt's line." },
];

export function BuiltTeaser() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24">
      <div className="overflow-hidden rounded-card bg-ink text-paper">
        <div className="grid grid-cols-1 gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow text-paper/55">How it is built</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">
              A custom storefront,
              <br />
              and the rules still hold
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-paper/70">
              Every page here is my own code talking to Shopify&apos;s Storefront API. Checkout is still
              Shopify&apos;s, and two Shopify Functions price and check the printing on every cart, whatever site
              sent it.
            </p>
            <Button to="/how-its-built" variant="accent" size="lg" className="mt-8">
              Read how it works
            </Button>
          </div>
          <ul className="space-y-3">
            {PIECES.map((p) => (
              <li key={p.label} className="rounded-field border border-paper/15 bg-paper/5 p-5">
                <p className="display text-lg">{p.label}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-paper/65">{p.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
