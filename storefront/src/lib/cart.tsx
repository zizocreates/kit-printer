// The cart, for the whole site: one provider, one hook. The cart id persists across visits (localStorage, guarded).
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { backend } from "./backend";
import type { Cart, CartError, CartResult, Print } from "./types";

const KEY = "kbz-cart-id";
const readId = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const writeId = (id: string | null) => { try { id ? localStorage.setItem(KEY, id) : localStorage.removeItem(KEY); } catch { /* private mode: fine */ } };

type CartState = {
  cart: Cart | null;
  busy: boolean;
  errors: CartError[];
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (variantId: string, quantity: number, print?: Print | null) => Promise<boolean>;
  update: (lineId: string, quantity: number) => Promise<boolean>;
  remove: (lineId: string) => Promise<boolean>;
  clearErrors: () => void;
  checkoutUrl: () => Promise<string | null>;
};

const Ctx = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<CartError[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = readId();
    if (id) backend.getCart(id).then((c) => (c ? setCart(c) : writeId(null)));
  }, []);

  // Every change goes through here: keep the newest cart, show Shopify's errors word for word, never throw.
  const run = useCallback(async (job: () => Promise<CartResult>) => {
    setBusy(true);
    setErrors([]);
    try {
      const { cart: next, errors: errs } = await job();
      if (next) { setCart(next); writeId(next.id); }
      setErrors(errs);
      return errs.length === 0 && !!next;
    } finally {
      setBusy(false);
    }
  }, []);

  const value = useMemo<CartState>(() => ({
    cart, busy, errors, open, setOpen,
    add: (variantId, quantity, print = null) => run(() => backend.addLine(cart?.id ?? null, { variantId, quantity, print })),
    update: (lineId, quantity) => (cart ? run(() => backend.updateLine(cart.id, lineId, quantity)) : Promise.resolve(false)),
    remove: (lineId) => (cart ? run(() => backend.removeLine(cart.id, lineId)) : Promise.resolve(false)),
    clearErrors: () => setErrors([]),
    // Ask for a fresh checkout URL when the buyer is ready: an old one can go stale (F4).
    checkoutUrl: async () => (cart ? (await backend.getCart(cart.id))?.checkoutUrl || cart.checkoutUrl || null : null),
  }), [cart, busy, errors, open, run]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart needs <CartProvider>");
  return v;
}
