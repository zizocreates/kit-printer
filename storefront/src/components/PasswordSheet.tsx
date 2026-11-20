// Before checkout: the store is a password-locked test store (every development store is), so hand over the
// password first. In demo mode there's no real cart to check out, so say so and point at the live store.
import { useState } from "react";
import { MODE, STORE_DOMAIN, STORE_PASSWORD } from "../lib/config";
import { Button } from "./ui/Button";
import { CloseButton, Sheet } from "./ui/Sheet";

type Props = { open: boolean; onClose: () => void; checkoutUrl: () => Promise<string | null> };

export function PasswordSheet({ open, onClose, checkoutUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [going, setGoing] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    try { await navigator.clipboard.writeText(STORE_PASSWORD); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* the password is on screen anyway */ }
  }
  async function go() {
    setGoing(true);
    setFailed(false);
    const url = await checkoutUrl();
    if (url) window.location.assign(url);
    else { setFailed(true); setGoing(false); }
  }

  return (
    <Sheet open={open} onClose={onClose} label="Checkout" side="center">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Checkout</p>
          <h2 className="display mt-2 text-3xl">{MODE === "live" ? "One password first" : "This is the demo"}</h2>
        </div>
        <CloseButton onClick={onClose} />
      </div>
      {MODE === "live" ? (
        <>
          <p className="text-sm leading-relaxed text-muted">
            Kits by Zizo is a Shopify test store, so its checkout sits behind a password. It's public on purpose. Use a test card at the end; nothing is charged.
          </p>
          <div className="my-5 flex items-center justify-between gap-3 rounded-field border border-dashed border-ink/25 bg-sweep px-4 py-3">
            <code className="font-mono text-lg font-semibold tracking-wide">{STORE_PASSWORD}</code>
            <button type="button" onClick={copy} className="rounded-pill bg-paper px-3 py-1.5 text-xs font-semibold shadow-card transition-colors hover:bg-ink hover:text-paper" data-autofocus>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <Button variant="accent" size="lg" className="w-full" onClick={go} disabled={going}>
            {going ? "Opening checkout…" : "Continue to checkout"}
          </Button>
          {failed && <p role="alert" className="mt-3 text-sm text-error">We couldn't open the checkout. Try again in a moment.</p>}
          <p className="mt-4 text-center text-xs text-muted">Shopify's own checkout. Your kit's price is set there by the Kit Printer Function.</p>
        </>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-muted">
            This copy runs without a store connection: the prices you saw came from the real Kit Printer Function code, running in your browser. To check out for real, use the live store (password <code className="font-semibold text-ink">{STORE_PASSWORD}</code>).
          </p>
          <Button href={`https://${STORE_DOMAIN}`} target="_blank" rel="noreferrer" variant="accent" size="lg" className="mt-6 w-full">
            Open the live store
          </Button>
        </>
      )}
    </Sheet>
  );
}
