// STUB by Claude so the router builds. The local agent owns this file (docs/STOREFRONT-PLAN.md): replace freely.
import { useCollection } from "../lib/useData";
import { KitCard } from "../components/KitCard";

export function Collection() {
  const { data, loading } = useCollection("kits");
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="display text-5xl">All kits</h1>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-busy={loading}>
        {(data ?? []).map((k, i) => <KitCard key={k.handle} kit={k} priority={i < 2} />)}
      </div>
    </div>
  );
}
