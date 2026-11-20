// For a product with no photo yet (the socks, today): a deliberate placeholder, never a broken image or a shirt
// that isn't the product.
export function NoPhoto({ title }: { title: string }) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-3 bg-[#ececea] p-6 text-center" role="img" aria-label={`${title}, photo coming soon`}>
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="text-muted/70" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="M21 15.5l-5-4.5-8 8" />
      </svg>
      <span className="display text-lg text-ink/70">{title}</span>
      <span className="eyebrow text-[0.62rem]">Photo coming soon</span>
    </div>
  );
}
