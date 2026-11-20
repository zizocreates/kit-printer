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

  it("an unknown kit is a 404, not a crash", async () => {
    open("/kits/no-such-kit");
    expect(await screen.findByRole("heading", { name: "Off the pitch" })).toBeTruthy();
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
