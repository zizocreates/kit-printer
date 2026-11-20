// STUB by Claude so the router builds. The local agent owns this file (docs/STOREFRONT-PLAN.md): replace freely.
import { useCollection } from "../lib/useData";
import { KitCard } from "../components/KitCard";
import { Button } from "../components/ui/Button";

export function Home() {
  const { data } = useCollection("kits");
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <p className="eyebrow">Season 26/27</p>
      <h1 className="display mt-3 text-6xl sm:text-8xl">Your name.<br />Your number.</h1>
      <Button to="/kits" variant="accent" size="lg" className="mt-8">Shop kits</Button>
      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {(data ?? []).map((k, i) => <KitCard key={k.handle} kit={k} priority={i < 2} />)}
      </div>
    </div>
  );
}
