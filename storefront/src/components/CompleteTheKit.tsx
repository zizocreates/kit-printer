// "Complete the look" from the big club stores: the socks, right on the kit's page, one tap to add.
import { useState } from "react";
import { Link } from "react-router";
import { useCart } from "../lib/cart";
import { useKit } from "../lib/useData";
import { format } from "../lib/money";
import { sized } from "../lib/cdn";
import { onlyVariant } from "../lib/variants";

export function CompleteTheKit({ not }: { not: string }) {
  const { add, busy, cart } = useCart();
  const { data: socks } = useKit("football-socks");
  const [added, setAdded] = useState(false);
  if (!socks || socks.handle === not) return null;
  const variant = onlyVariant(socks) ?? socks.variants.find((v) => v.availableForSale);
  if (!variant) return null;
  const inBag = cart?.lines.some((l) => l.kit.handle === socks.handle);
  const img = socks.images[0];

  async function addSocks() {
    if (await add(variant!.id, 1, null)) { setAdded(true); setTimeout(() => setAdded(false), 1800); }
  }

  return (
    <section aria-label="Complete the kit" className="flex items-center gap-4 rounded-[18px] border border-line p-3">
      <Link to={`/kits/${socks.handle}`} className="size-20 shrink-0 overflow-hidden rounded-[12px] bg-[#ececea]">
        {img && <img src={sized(img.url, 200)} alt={img.altText ?? ""} className="size-full object-cover" loading="lazy" />}
      </Link>
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-[0.62rem]">Complete the kit</p>
        <Link to={`/kits/${socks.handle}`} className="mt-1 block truncate font-semibold hover:underline">{socks.title}</Link>
        <p className="text-sm tabular-nums text-muted">{format(variant.price)}</p>
      </div>
      <button
        type="button"
        onClick={addSocks}
        disabled={busy || !variant.availableForSale}
        aria-label={`Add ${socks.title} to the bag`}
        className="inline-flex min-h-11 shrink-0 items-center rounded-pill border border-ink/15 px-4 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:opacity-40"
      >
        {added ? "Added ✓" : inBag ? "Add another" : "Add"}
      </button>
    </section>
  );
}
