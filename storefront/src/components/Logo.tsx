// The wordmark: KITS in Oswald, "by Zizo" small beside it.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <span className="display text-2xl tracking-tight">Kits</span>
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted">by Zizo</span>
    </span>
  );
}
