// The bag. Prices here are what Shopify's Cart Transform set (a printed line costs kit + print), and any refusal
// is the Cart Validation's own words.
import { useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "../lib/cart";
import { format } from "../lib/money";
import type { CartLine } from "../lib/types";
import { Button } from "./ui/Button";
import { CloseButton, Sheet } from "./ui/Sheet";
import { PasswordSheet } from "./PasswordSheet";

export function CartDrawer() {
  const { cart, open, setOpen, errors, busy, checkoutUrl } = useCart();
  const [paying, setPaying] = useState(false);
  const close = () => setOpen(false);
  const lines = cart?.lines ?? [];

  return (
    <>
      <Sheet open={open} onClose={close} label="Your bag">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="display text-2xl">Your bag {cart?.totalQuantity ? <span className="text-muted">({cart.totalQuantity})</span> : null}</h2>
          <CloseButton onClick={close} label="Close bag" />
        </div>

        {errors.length > 0 && (
          <div role="alert" className="mx-6 mt-4 rounded-field border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            {errors.map((e) => <p key={e.code + e.message}>{e.message}</p>)}
          </div>
        )}

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="display text-3xl">Nothing here yet</p>
            <p className="max-w-xs text-sm text-muted">Pick a kit, put your name on the back, and it'll show up here priced by Shopify.</p>
            <Button to="/kits" onClick={close}>Shop kits</Button>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-line overflow-y-auto px-6" aria-busy={busy}>
            <AnimatePresence initial={false}>
              {lines.map((line) => (
                <motion.li key={line.id} layout initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <Line line={line} onNavigate={close} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {lines.length > 0 && cart && (
          <div className="border-t border-line bg-sweep/60 px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">Subtotal</span>
              <span className="text-lg font-semibold tabular-nums">{format(cart.subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">Priced by Kit Printer in Shopify's checkout. Shipping and tax at checkout.</p>
            <Button variant="accent" size="lg" className="mt-4 w-full" onClick={() => setPaying(true)} disabled={busy}>
              Checkout
            </Button>
          </div>
        )}
      </Sheet>
      <PasswordSheet open={paying} onClose={() => setPaying(false)} checkoutUrl={checkoutUrl} />
    </>
  );
}

function Line({ line, onNavigate }: { line: CartLine; onNavigate: () => void }) {
  const { update, remove, busy } = useCart();
  const img = line.kit.images[0]; // the front: the sample print on [1] would show someone else's name
  return (
    <div className="flex gap-4 py-5">
      <Link to={`/kits/${line.kit.handle}`} onClick={onNavigate} className="size-24 shrink-0 overflow-hidden rounded-[14px] bg-[#ececea]">
        {img && <img src={img.url} alt="" className="size-full object-cover" />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-3">
          <Link to={`/kits/${line.kit.handle}`} onClick={onNavigate} className="font-semibold leading-snug hover:underline">{line.kit.title}</Link>
          <span className="shrink-0 font-semibold tabular-nums">{format(line.lineTotal)}</span>
        </div>
        <p className="mt-1 text-sm text-muted">Size {line.variant.size}</p>
        {line.print && (
          <p className="mt-1 text-sm">
            <span className="text-muted">Print: </span>
            <span className="font-[family-name:var(--font-display)] font-bold uppercase tracking-[0.08em]">{[line.print.name, line.print.number].filter(Boolean).join(" ")}</span>
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center rounded-pill border border-ink/15">
            <Step label="One fewer" disabled={busy} onClick={() => (line.quantity > 1 ? update(line.id, line.quantity - 1) : remove(line.id))}>−</Step>
            <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-label={`Quantity ${line.quantity}`}>{line.quantity}</span>
            <Step label="One more" disabled={busy} onClick={() => update(line.id, line.quantity + 1)}>+</Step>
          </div>
          <button type="button" disabled={busy} onClick={() => remove(line.id)} className="text-xs font-medium text-muted underline-offset-4 hover:text-ink hover:underline">
            Remove
          </button>
        </div>
        {line.quantity > 1 && <p className="mt-2 text-xs text-muted tabular-nums">{format(line.unitPrice)} each</p>}
      </div>
    </div>
  );
}

function Step({ children, label, onClick, disabled }: { children: string; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="grid size-9 place-items-center rounded-full text-lg leading-none transition-colors hover:bg-sweep disabled:opacity-40">
      {children}
    </button>
  );
}
