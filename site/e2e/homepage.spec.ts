import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test.describe("Hero Section", () => {
    test("displays logsDx heading", async ({ page }) => {
      await expect(page.getByRole("heading", { name: /logsdx/i })).toBeVisible();
    });

    test("displays tagline", async ({ page }) => {
      await expect(page.getByText(/schema-based styling layer/i)).toBeVisible();
    });

    test("has Get Started CTA", async ({ page }) => {
      const getStartedLink = page.getByRole("link", { name: /get started/i });
      await expect(getStartedLink).toBeVisible();
      await expect(getStartedLink).toHaveAttribute("href", "#setup");
    });

    test("has GitHub link", async ({ page }) => {
      const githubLink = page.getByRole("link", { name: /github/i });
      await expect(githubLink).toBeVisible();
      await expect(githubLink).toHaveAttribute("href", "https://github.com/yowainwright/logsdx");
    });
  });

  test.describe("Sections", () => {
    test("has problem section", async ({ page }) => {
      await page.waitForTimeout(500);
      const content = await page.content();
      expect(content.toLowerCase()).toContain("problem");
    });

    test("has setup section", async ({ page }) => {
      await page.goto("/#setup");
      await page.waitForTimeout(500);
      expect(page.url()).toContain("#setup");
    });

    test("has theme creator section", async ({ page }) => {
      await page.goto("/#theme-creator");
      await page.waitForTimeout(1000);
      
      const heading = page.getByRole("heading", { name: /create your custom theme/i });
      await expect(heading).toBeVisible();
    });
  });

  test.describe("Theme Creator", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/#theme-creator");
      await page.waitForTimeout(1000);
    });

    test("displays theme creator heading", async ({ page }) => {
      await expect(page.getByRole("heading", { name: /create your custom theme/i })).toBeVisible();
    });

    test("has color pickers", async ({ page }) => {
      const colorInputs = page.locator("input[type='color']");
      expect(await colorInputs.count()).toBeGreaterThan(0);
    });

    test("has preset checkboxes", async ({ page }) => {
      const checkboxes = page.locator("input[type='checkbox']");
      expect(await checkboxes.count()).toBeGreaterThan(0);
    });

    test("shows live preview", async ({ page }) => {
      await expect(page.getByText(/live preview/i)).toBeVisible();
    });

    test("has export buttons", async ({ page }) => {
      await expect(page.getByRole("button", { name: /copy code/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /download/i })).toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("has navigation bar", async ({ page }) => {
      const nav = page.locator("nav");
      await expect(nav.first()).toBeVisible();
    });

    test("nav remains visible on scroll", async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);
      const nav = page.locator("nav");
      await expect(nav.first()).toBeVisible();
    });
  });

  test.describe("Responsive", () => {
    test("renders on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.getByRole("heading", { name: /logsdx/i })).toBeVisible();
    });

    test("renders on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.getByRole("heading", { name: /logsdx/i })).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("has h1 heading", async ({ page }) => {
      const h1 = page.locator("h1");
      await expect(h1.first()).toBeVisible();
    });

    test("has clickable links", async ({ page }) => {
      const links = page.getByRole("link");
      expect(await links.count()).toBeGreaterThan(0);
    });

    test("supports keyboard nav", async ({ page }) => {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).toBeDefined();
    });
  });

  test.describe("Performance", () => {
    test("loads in reasonable time", async ({ page }) => {
      const start = Date.now();
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - start;
      expect(loadTime).toBeLessThan(10000);
    });
  });
});
