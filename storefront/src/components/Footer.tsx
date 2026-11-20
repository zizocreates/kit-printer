import { Link } from "react-router";
import { REPO_URL } from "../lib/config";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-sweep">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            A custom storefront on Shopify's Storefront API. The cart, the price and the checks on your name and number all run on Shopify.
          </p>
        </div>
        <nav aria-label="Shop" className="space-y-2 text-sm">
          <p className="eyebrow mb-3">Shop</p>
          <Link className="block hover:underline" to="/kits">All kits</Link>
          <Link className="block hover:underline" to="/kits/kanata-fc-home-kit">Kanata FC Home</Link>
          <Link className="block hover:underline" to="/kits/kanata-fc-away-kit">Kanata FC Away</Link>
        </nav>
        <nav aria-label="Project" className="space-y-2 text-sm">
          <p className="eyebrow mb-3">The build</p>
          <Link className="block hover:underline" to="/how-its-built">How it's built</Link>
          <a className="block hover:underline" href={REPO_URL} target="_blank" rel="noreferrer">Source on GitHub</a>
        </nav>
      </div>
      <p className="border-t border-line px-4 py-5 text-center text-xs text-muted">Built by Zyad Hossameldien, 2026.</p>
    </footer>
  );
}
