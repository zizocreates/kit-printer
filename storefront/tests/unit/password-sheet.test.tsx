// The live-mode checkout sheet. Unlocking a Shopify test store lands on its home page, so the sheet
// must offer the unlock as its own step, in a new tab, and keep the checkout link here.
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

vi.mock("../../src/lib/config", async (orig) => ({ ...(await orig<typeof import("../../src/lib/config")>()), MODE: "live" }));
const { PasswordSheet } = await import("../../src/components/PasswordSheet");

describe("checkout password sheet (live)", () => {
  it("unlocks in a new tab, then sends the buyer to the fresh checkout URL", async () => {
    const assign = vi.fn();
    Object.defineProperty(window, "location", { value: { ...window.location, assign }, configurable: true });
    const checkoutUrl = vi.fn().mockResolvedValue("https://kitsbyzizo.myshopify.com/cart/c/abc");
    render(<MemoryRouter><PasswordSheet open onClose={() => {}} checkoutUrl={checkoutUrl} /></MemoryRouter>);

    const unlock = screen.getByRole("link", { name: "Open the password page" });
    expect(unlock.getAttribute("href")).toBe("https://kitsbyzizo.myshopify.com/password");
    expect(unlock.getAttribute("target")).toBe("_blank");
    expect(screen.getByText("futureshopifolk")).toBeTruthy();
    fireEvent.click(unlock);
    expect(screen.getByRole("link", { name: "Open the password page again" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Continue to checkout" }));
    await waitFor(() => expect(assign).toHaveBeenCalledWith("https://kitsbyzizo.myshopify.com/cart/c/abc"));
  });
});
