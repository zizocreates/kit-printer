// The UI on the demo backend, which runs the REAL Kit Printer Functions. These walk what a buyer does.
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "../../src/App";
import { PrintFields } from "../../src/components/PrintFields";
import { PrintOverlay } from "../../src/components/PrintOverlay";
import { check } from "../../src/lib/print";

function open(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}

describe("product page", () => {
  it("prints the name as you type, prices kit + print, and the bag shows the Function's price", async () => {
    open("/kits/kanata-fc-away-kit");
    await screen.findByRole("heading", { level: 1, name: /Kanata FC Away Kit/ });
    expect(screen.getAllByText("$89.99").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("radio", { name: "M" }));
    fireEvent.click(screen.getByRole("radio", { name: /Personalize/ }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "ronaldo" } });
    fireEvent.change(screen.getByLabelText("Number"), { target: { value: "7" } });

    // the big stage and the phone-sized preview both show it
    expect(screen.getAllByTestId("print-name").map((n) => n.textContent)).toEqual(["RONALDO", "RONALDO"]);
    expect(screen.getAllByTestId("print-number").map((n) => n.textContent)).toEqual(["7", "7"]);
    expect(screen.getByText("7 / 12 characters")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Front" }).getAttribute("aria-pressed")).toBe("false"); // turned to the back

    fireEvent.click(screen.getAllByRole("button", { name: /Add to bag · \$104\.99/ })[0]);
    const bag = await screen.findByRole("dialog", { name: "Your bag" });
    await waitFor(() => expect(within(bag).getByText("RONALDO 7")).toBeTruthy());
    expect(within(bag).getAllByText("$104.99").length).toBeGreaterThan(0);
    expect(within(bag).getByText("Size M")).toBeTruthy();
  });

  it("asks for a size before adding", async () => {
    open("/kits/kanata-fc-home-kit");
    await screen.findByRole("heading", { level: 1 });
    fireEvent.click(screen.getAllByRole("button", { name: /Add to bag/ })[0]);
    expect(await screen.findByText("Pick a size first.")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("refuses number 100 with the shared rules' own words and adds nothing", async () => {
    open("/kits/kanata-fc-home-kit");
    await screen.findByRole("heading", { level: 1 });
    fireEvent.click(screen.getByRole("radio", { name: "L" }));
    fireEvent.click(screen.getByRole("radio", { name: /Personalize/ }));
    fireEvent.change(screen.getByLabelText("Number"), { target: { value: "100" } });
    expect(await screen.findByText("Numbers go from 1 to 99.")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: /Add to bag/ })[0]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("the bag offers the socks until they're in it, and they add without a print", async () => {
    open("/kits/kanata-fc-home-kit");
    await screen.findByRole("heading", { level: 1 });
    const small = screen.getByRole("radio", { name: "S" }) as HTMLInputElement;
    fireEvent.click(small);
    await waitFor(() => expect(small.checked).toBe(true));
    fireEvent.click(screen.getAllByRole("button", { name: /Add to bag/ })[0]);
    const bag = await screen.findByRole("dialog", { name: "Your bag" }, { timeout: 4000 });
    // Like the real store: the socks have one "Default Title" variant, so it's a single Add, no size pills.
    fireEvent.click(await within(bag).findByRole("button", { name: "Add Kanata FC Socks to the bag" }, { timeout: 4000 }));
    await waitFor(() => expect(within(bag).queryByText("Complete the kit")).toBeNull(), { timeout: 4000 });
    expect(within(bag).getByText("$104.98")).toBeTruthy(); // 89.99 + 14.99, no print on either
    expect(within(bag).queryByText(/Default Title/)).toBeNull();
  });

  it("a product with one default variant has no size picker and adds straight away", async () => {
    open("/kits/football-socks");
    await screen.findByRole("heading", { level: 1, name: /Socks/ });
    expect(screen.queryByRole("radiogroup", { name: "Size" })).toBeNull();
    fireEvent.click(screen.getAllByRole("button", { name: /Add to bag · \$14\.99/ })[0]);
    const bag = await screen.findByRole("dialog", { name: "Your bag" }, { timeout: 4000 });
    await waitFor(() => expect(within(bag).getAllByText("$14.99").length).toBeGreaterThan(0));
  });

  it("the size guide opens as a dialog", async () => {
    open("/kits/kanata-fc-home-kit");
    await screen.findByRole("heading", { level: 1 });
    fireEvent.click(screen.getByRole("button", { name: "Size guide" }));
    const guide = await screen.findByRole("dialog", { name: "Size guide" });
    expect(within(guide).getByRole("rowheader", { name: "XL" })).toBeTruthy();
  });

  it("an unknown kit is a 404, not a crash", async () => {
    open("/kits/no-such-kit");
    expect(await screen.findByRole("heading", { name: "Off the pitch" })).toBeTruthy();
  });
});

describe("ideas from club stores", () => {
  it("a popular print fills both boxes in one tap and shows on the shirt", async () => {
    open("/kits/rideau-united-home-kit");
    await screen.findByRole("heading", { level: 1 });
    fireEvent.click(screen.getByRole("radio", { name: /Personalize/ }));
    fireEvent.click(screen.getByRole("button", { name: "MESSI 10" }));
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("MESSI");
    expect((screen.getByLabelText("Number") as HTMLInputElement).value).toBe("10");
    expect(screen.getAllByTestId("print-number")[0].textContent).toBe("10");
    expect(screen.getByRole("button", { name: "MESSI 10" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("the kit page offers the socks, and says personalised kits can't be returned", async () => {
    open("/kits/kanata-fc-away-kit");
    await screen.findByRole("heading", { level: 1 });
    const offer = await screen.findByRole("region", { name: "Complete the kit" });
    expect(within(offer).getByRole("button", { name: "Add Kanata FC Socks to the bag" })).toBeTruthy();
    expect(screen.getByText(/can only be returned if it's faulty/)).toBeTruthy();
  });

  it("the theme-only 'add your name below' line is left out of the real description", async () => {
    const { forThisSite } = await import("../../src/routes/Product");
    const real = (await import("../../src/fixtures/product-kanata-fc-away-kit.json")).default.data.product.descriptionHtml;
    const out = forThisSite(real);
    expect(out).not.toMatch(/below/);
    expect(out).toContain("Royal blue with white trim.");
    expect(out).toContain("made-up club");
  });
});

describe("pieces", () => {
  it("PrintFields shows counters and the error only when asked", () => {
    const r = check("VAN DIJK", "4");
    const { rerender } = render(<PrintFields name="VAN DIJK" number="4" onName={() => {}} onNumber={() => {}} result={r} showErrors />);
    expect(screen.getByText("8 / 12 characters")).toBeTruthy();
    expect(screen.getByText("1 / 2 numbers")).toBeTruthy();
    const bad = check("ABCDEFGHIJKLM", "");
    rerender(<PrintFields name="ABCDEFGHIJKLM" number="" onName={() => {}} onNumber={() => {}} result={bad} showErrors={false} />);
    expect(screen.getByRole("alert").textContent).toBe("");
    rerender(<PrintFields name="ABCDEFGHIJKLM" number="" onName={() => {}} onNumber={() => {}} result={bad} showErrors />);
    expect(screen.getByRole("alert").textContent).toBe("Names can be up to 12 letters.");
    expect(screen.getByLabelText("Name").getAttribute("aria-invalid")).toBe("true");
  });

  it("PrintOverlay uses the theme block's coordinates", () => {
    render(<PrintOverlay name="SAKA" number="7" animate={false} />);
    const name = screen.getByTestId("print-name");
    const num = screen.getByTestId("print-number");
    expect([name.getAttribute("x"), name.getAttribute("y"), name.getAttribute("font-size")]).toEqual(["500", "292", "60"]);
    expect([num.getAttribute("x"), num.getAttribute("y"), num.getAttribute("font-size")]).toEqual(["500", "640", "300"]);
  });

  it("the cart drawer's empty state links to the kits", async () => {
    open("/");
    fireEvent.click(screen.getByRole("button", { name: /Bag, 0 items/ }));
    const bag = await screen.findByRole("dialog", { name: "Your bag" });
    expect(within(bag).getByText("Nothing here yet")).toBeTruthy();
    expect(within(bag).getByRole("link", { name: "Shop kits" }).getAttribute("href")).toBe("/kits");
  });
});
