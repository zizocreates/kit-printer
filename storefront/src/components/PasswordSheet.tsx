// Before checkout: the store is a password-locked test store (every development store is). Unlocking lands on
// the store's home page (spike e), so it's two steps: unlock in a new tab, then follow the checkout link here.
// In demo mode there's no real cart to check out, so say so and point at the live store.
import { useState } from "react";
import { MODE, STORE_DOMAIN, STORE_PASSWORD } from "../lib/config";
import { Button } from "./ui/Button";
import { CloseButton, Sheet } from "./ui/Sheet";

type Props = { open: boolean; onClose: () => void; checkoutUrl: () => Promise<string | null> };

const UNLOCKED = "kbz-store-unlocked";
const wasUnlocked = () => { try { return sessionStorage.getItem(UNLOCKED) === "1"; } catch { return false; } };

export function PasswordSheet({ open, onClose, checkoutUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [unlocked, setUnlocked] = useState(wasUnlocked);
  const [going, setGoing] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    try { await navigator.clipboard.writeText(STORE_PASSWORD); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* the password is on screen anyway */ }
  }
  // Shopify's password page sends you to the store's home page afterwards, never back to a checkout, so the
  // unlock happens in its own tab and the checkout link is followed from here once the store cookie is set.
  function unlock() {
    try { sessionStorage.setItem(UNLOCKED, "1"); } catch { /* fine */ }
    setUnlocked(true);
  }
  async function go() {
    setGoing(true);
    setFailed(false);
    const url = await checkoutUrl();
    if (url) window.location.assign(url);
    else { setFailed(true); setGoing(false); }
  }

  const stepCls = (on: boolean) => `grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${on ? "bg-ok text-paper" : "bg-ink text-paper"}`;

  return (
    <Sheet open={open} onClose={onClose} label="Checkout" side="center">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Checkout</p>
          <h2 className="display mt-2 text-3xl">{MODE === "live" ? "Two quick steps" : "This is the demo"}</h2>
        </div>
        <CloseButton onClick={onClose} />
      </div>
      {MODE === "live" ? (
        <>
          <p className="text-sm leading-relaxed text-muted">
            Kits by Zizo is a Shopify test store, so its checkout sits behind a password. It's public on purpose, and payments are fake.
          </p>
          <ol className="mt-5 space-y-5">
            <li className="flex gap-3">
              <span className={stepCls(unlocked)} aria-hidden>{unlocked ? "✓" : "1"}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Unlock the store</p>
                <p className="mt-0.5 text-sm text-muted">Opens in a new tab. Enter the password there, then come back to this tab.</p>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-field border border-dashed border-ink/25 bg-sweep px-4 py-2.5">
                  <code className="font-mono text-base font-semibold tracking-wide">{STORE_PASSWORD}</code>
                  <button type="button" onClick={copy} className="rounded-pill bg-paper px-3 py-1.5 text-xs font-semibold shadow-card transition-colors hover:bg-ink hover:text-paper" data-autofocus>
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <Button href={`https://${STORE_DOMAIN}/password`} target="_blank" rel="noreferrer" onClick={unlock} variant={unlocked ? "outline" : "solid"} className="mt-3 w-full">
                  {unlocked ? "Open the password page again" : "Open the password page"}
                </Button>
              </div>
            </li>
            <li className="flex gap-3">
              <span className={stepCls(false)} aria-hidden>2</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Continue to checkout</p>
                <p className="mt-0.5 text-sm text-muted">Shopify's own checkout, with your kit priced by the Kit Printer Function.</p>
                <Button variant="accent" size="lg" className="mt-3 w-full" onClick={go} disabled={going}>
                  {going ? "Opening checkout…" : "Continue to checkout"}
                </Button>
                {!unlocked && <p className="mt-2 text-xs text-muted">Already unlocked the store earlier? Go straight ahead.</p>}
                {failed && <p role="alert" className="mt-2 text-sm text-error">We couldn't open the checkout. Try again in a moment.</p>}
              </div>
            </li>
          </ol>
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
