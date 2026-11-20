import { MODE } from "../lib/config";

// The thin strip above the header. In demo mode it says so, so nobody thinks a demo cart is a real order.
export function AnnouncementBar() {
  return (
    <div className="bg-ink px-4 py-2 text-center text-xs font-medium tracking-wide text-paper/90">
      {MODE === "demo"
        ? "Demo mode: prices come from the real Kit Printer Functions, running in your browser."
        : "Add any name and number. Printed by Kit Printer, priced by Shopify Functions."}
    </div>
  );
}
