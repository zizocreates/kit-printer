// The QA pass: every page, at every width, checked from code rather than by eye alone. Screenshots land in
// test-results/qa/ for the report.
//
//   npx playwright test qa.spec.ts --project=desktop
import { test, expect, type Page } from "@playwright/test";

const WIDTHS = [360, 390, 768, 1024, 1440];

const PAGES: { path: string; name: string }[] = [
  { path: "/", name: "home" },
  { path: "/kits", name: "kits" },
  { path: "/kits/kanata-fc-away-kit", name: "product" },
  { path: "/kits/football-socks", name: "socks" },
  { path: "/how-its-built", name: "how-its-built" },
  { path: "/no-such-page", name: "404" },
];

/** Anything a finger has to hit should be at least 44px. Inline links inside prose are not tap targets. */
async function smallTapTargets(page: Page) {
  return page.evaluate(() => {
    const bad: { label: string; w: number; h: number }[] = [];
    const nodes = document.querySelectorAll("button, input, select, summary, label");
    for (const el of nodes) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue; // not rendered
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") continue;
      if (el.closest(".sr-only")) continue;
      // The sr-only radio inputs have no box of their own: the label around them is the target.
      if (el.tagName === "INPUT" && (el as HTMLInputElement).type === "radio" && el.classList.contains("sr-only")) continue;
      if (r.height < 44 - 0.5 || r.width < 24) {
        bad.push({ label: (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) });
      }
    }
    return bad;
  });
}

async function overflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

for (const width of WIDTHS) {
  test.describe(`at ${width}px`, () => {
    for (const p of PAGES) {
      test(`${p.name} fits, with no sideways scroll and no tiny tap targets`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(p.path);
        await page.getByRole("heading", { level: 1 }).first().waitFor();
        // let images settle so a late load cannot widen the page after the check
        await page.waitForLoadState("networkidle").catch(() => {});

        expect(await overflow(page), `${p.name} at ${width} scrolls sideways`).toBeLessThanOrEqual(1);

        // Tap targets are only judged under touch emulation (the mobile project). On a pointer device the kit
        // card's quick-add panel is shown, and those 36px pills are mouse targets, not thumb targets: the panel
        // is display:none on touch, so measuring it there would be measuring something a phone never gets.
        if (test.info().project.name === "mobile") {
          const small = await smallTapTargets(page);
          expect(small, `${p.name} at ${width} has tap targets under 44px high: ${JSON.stringify(small)}`).toEqual([]);
        }

        await page.screenshot({ path: `test-results/qa/${p.name}-${width}.png`, fullPage: true });
      });
    }
  });
}

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the hero shows one finished print and does not cycle", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const name = page.locator('[data-testid="print-name"]').first();
    await expect(name).toHaveText("RONALDO");
    const first = await name.textContent();
    await page.waitForTimeout(4500); // longer than one full cycle
    expect(await name.textContent(), "the hero should not cycle with reduced motion").toBe(first);
    await page.screenshot({ path: "test-results/qa/home-reduced-motion.png", fullPage: true });
  });

  test("the product page still shows the print without animating the flip", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/kits/kanata-fc-away-kit");
    await page.getByRole("radiogroup", { name: "Size" }).locator("label").filter({ hasText: /^\s*M\s*$/ }).first().click();
    await page.getByRole("radio", { name: /Personalize/ }).click();
    await page.getByLabel("Name", { exact: true }).fill("RONALDO");
    await page.getByLabel("Number", { exact: true }).fill("7");
    await expect(page.locator('[data-testid="print-name"]').first()).toHaveText("RONALDO");
    await page.screenshot({ path: "test-results/qa/product-reduced-motion.png", fullPage: true });
  });
});

test.describe("keyboard only", () => {
  test("a kit can be chosen, named and added to the bag with the keyboard", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/kits/kanata-fc-away-kit");

    // Size is a radio group: one tab stop, arrow keys move within it.
    await page.getByRole("radio", { name: "S", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "M", exact: true })).toBeChecked();

    await page.getByRole("radio", { name: /Personalize/ }).focus();
    await page.keyboard.press("Enter");
    await page.getByLabel("Name", { exact: true }).fill("KEYBOARD");
    await page.getByLabel("Number", { exact: true }).fill("9");

    const add = page.locator('button:has-text("Add to bag"):visible').first();
    await add.focus();
    await page.keyboard.press("Enter");

    const bag = page.getByRole("dialog", { name: "Your bag" });
    await expect(bag).toBeVisible();
    await expect(bag.getByText("KEYBOARD 9")).toBeVisible();
  });
});
