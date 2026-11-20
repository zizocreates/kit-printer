// The live suite. These run against the real kitsbyzizo store, so they prove the thing the project claims:
// a cart built by our own site is priced and checked by Kit Printer's Shopify Functions.
import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";

const AWAY = "/kits/kanata-fc-away-kit";
const SOCKS = "/kits/football-socks";

/** Fails the test on any console error. Call at the top of each test. */
function watchConsole(page: Page): string[] {
  const bad: string[] = [];
  page.on("console", (m: ConsoleMessage) => {
    if (m.type() === "error") bad.push(m.text());
  });
  page.on("pageerror", (e) => bad.push(`pageerror: ${e.message}`));
  return bad;
}

/** The Add to bag button that is actually on screen: the page has a desktop one and a sticky phone one. */
const addToBag = (page: Page) => page.locator('button:has-text("Add to bag"):visible').first();

const bag = (page: Page) => page.getByRole("dialog", { name: "Your bag" });

/**
 * Pick a size. The radio input itself is `sr-only` (one tab stop, arrow keys work), so it has no clickable box:
 * click the label that wraps it, the way a person does, then assert the radio really is checked.
 */
async function pickSize(page: Page, size: string) {
  const group = page.getByRole("radiogroup", { name: "Size" });
  await group.locator("label").filter({ hasText: new RegExp(`^\\s*${size}\\s*$`) }).first().click();
  await expect(page.getByRole("radio", { name: size, exact: true })).toBeChecked();
}

async function noSidewaysScroll(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(over, "the page should not scroll sideways").toBeLessThanOrEqual(1);
}

test.describe("Kits by Zizo, against the real store", () => {
  test("the kits page lists the four kits and filters by club", async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto("/kits");

    const cards = page.locator("main article");
    await expect(cards).toHaveCount(4);
    await expect(page.getByRole("heading", { level: 1, name: "All kits" })).toBeVisible();

    // The socks are offered under the grid, not inside it.
    await expect(page.getByRole("heading", { name: /Kanata FC Socks/i })).toBeVisible();

    await page.getByRole("button", { name: "Kanata FC", exact: true }).click();
    await expect(cards).toHaveCount(2);
    await expect(page.getByRole("button", { name: "Kanata FC", exact: true })).toHaveAttribute("aria-pressed", "true");

    await noSidewaysScroll(page);
    expect(errors).toEqual([]);
  });

  test("a printed kit reaches the bag at $104.99 with the print on the line", async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(AWAY);

    await expect(page.getByRole("heading", { level: 1, name: /Away Kit/i })).toBeVisible();
    await pickSize(page, "M");
    await page.getByRole("radio", { name: /Personalize/ }).click();

    await page.getByLabel("Name", { exact: true }).fill("RONALDO");
    await page.getByLabel("Number", { exact: true }).fill("7");

    // The shirt shows the print at the theme block's coordinates.
    await expect(page.locator('[data-testid="print-name"]').first()).toHaveText("RONALDO");
    await expect(page.locator('[data-testid="print-number"]').first()).toHaveText("7");

    // The page adds the print price itself before the cart confirms it.
    await expect(addToBag(page)).toContainText("$104.99");

    await addToBag(page).click();

    // And this is Shopify's own number, after the Cart Transform ran.
    await expect(bag(page)).toBeVisible();
    await expect(bag(page).getByText("Print:")).toBeVisible();
    await expect(bag(page).getByText("RONALDO 7")).toBeVisible();
    await expect(bag(page).getByText("$104.99").first()).toBeVisible();
    await expect(bag(page).getByText("Size M")).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("number 100 is refused in Shopify's own words, and nothing is added", async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(AWAY);

    await pickSize(page, "M");
    await page.getByRole("radio", { name: /Personalize/ }).click();
    await page.getByLabel("Name", { exact: true }).fill("RONALDO");

    // 100 breaks the shared rules, so the page itself should say so before Shopify is asked.
    await page.getByLabel("Number", { exact: true }).fill("100");
    await expect(page.getByRole("alert").filter({ hasText: /1 to 99/ }).first()).toBeVisible();

    await addToBag(page).click();

    // Either way, the bag must not have gained a line.
    await expect(bag(page)).toBeHidden();
    await expect(page.getByRole("button", { name: /bag/i }).first()).not.toContainText("1");

    expect(errors).toEqual([]);
  });

  test("the socks cannot be printed, and add to the bag without one", async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(SOCKS);

    await expect(page.getByRole("heading", { level: 1, name: /Socks/i })).toBeVisible();
    // No personalisation offered at all, because print_price is null on this product.
    await expect(page.getByRole("radio", { name: /Personalize/ })).toHaveCount(0);
    await expect(page.getByText(/can't be printed/i)).toBeVisible();

    // One "Default Title" variant: there is no size to pick, and none is shown.
    await expect(page.getByRole("radiogroup", { name: "Size" })).toHaveCount(0);
    await expect(page.getByText("Default Title")).toHaveCount(0);
    await addToBag(page).click();

    await expect(bag(page)).toBeVisible();
    await expect(bag(page).getByText(/Socks/)).toBeVisible();
    await expect(bag(page).getByText("Print:")).toHaveCount(0);
    await expect(bag(page).getByText("$14.99").first()).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("checkout asks for the store password before it sends you to Shopify", async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(AWAY);

    await pickSize(page, "M");
    await addToBag(page).click();
    await expect(bag(page)).toBeVisible();

    await bag(page).getByRole("button", { name: "Checkout" }).click();

    // The sheet hands over the password first: a dev store's checkout sits behind it (F6). Spike e proved that
    // submitting the password lands the buyer on the store HOME page, not their checkout, so the sheet has to be
    // two steps. Step one has to open /password in its own tab, or the buyer loses the cart page they came from.
    const sheet = page.getByRole("dialog", { name: "Checkout" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText("futureshopifolk")).toBeVisible();

    await expect(sheet.getByText("Unlock the store")).toBeVisible();
    const unlock = sheet.getByRole("link", { name: /password page/i });
    await expect(unlock).toHaveAttribute("href", /\/password$/);
    await expect(unlock).toHaveAttribute("target", "_blank");

    await expect(sheet.getByRole("button", { name: "Continue to checkout" })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("an unknown address is the 404 kit", async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto("/kits/no-such-kit-here");

    await expect(page.getByRole("heading", { level: 1, name: "Off the pitch" })).toBeVisible();
    await expect(page.locator('[data-testid="print-number"]').first()).toHaveText("404");

    await page.goto("/this-page-does-not-exist");
    await expect(page.getByRole("heading", { level: 1, name: "Off the pitch" })).toBeVisible();

    await noSidewaysScroll(page);
    expect(errors).toEqual([]);
  });

  test("the home page and how it's built render, with no sideways scroll", async ({ page }) => {
    const errors = watchConsole(page);

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Your name");
    await expect(page.locator("main article")).toHaveCount(4);
    // The live demo in step 2 runs the shared rules.
    await page.getByLabel("Try a number").fill("100");
    await expect(page.getByText(/1 to 99/).first()).toBeVisible();
    await noSidewaysScroll(page);

    await page.goto("/how-its-built");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await noSidewaysScroll(page);

    expect(errors).toEqual([]);
  });
});
