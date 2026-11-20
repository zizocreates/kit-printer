import { useEffect } from "react";
import { Button } from "../components/ui/Button";
import { PrintOverlay } from "../components/PrintOverlay";

// A 404 printed on the back of a kit.
export function NotFound() {
  useEffect(() => { document.title = "Not found · Kits by Zizo"; }, []);
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
      <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-card bg-[#ececea]">
        <img src="/demo/kanata-fc-home-back-blank.webp" alt="" className="size-full object-cover" />
        <PrintOverlay name="NOT FOUND" number="404" />
      </div>
      <div>
        <p className="eyebrow">Error 404</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">Off the pitch</h1>
        <p className="mt-4 max-w-md leading-relaxed text-muted">That page isn't here. It may have moved, or the link has a typo. The kits are all still in one place.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button to="/kits" variant="accent" size="lg">Shop kits</Button>
          <Button to="/" variant="outline" size="lg">Home</Button>
        </div>
      </div>
    </section>
  );
}
