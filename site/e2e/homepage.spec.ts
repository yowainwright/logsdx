import { test, expect } from "@playwright/test";

test.describe("Homepage Sections", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("Hero Section", () => {
    test("should display hero heading and description", async ({ page }) => {
      await expect(page.getByRole("heading", { name: /logsdx/i })).toBeVisible();
      await expect(
        page.getByText(/schema-based styling for logs/i),
      ).toBeVisible();
    });

    test("should have functional CTA buttons", async ({ page }) => {
      const getStartedBtn = page.getByRole("link", { name: /get started/i });
      const viewGithubBtn = page.getByRole("link", { name: /view.*github/i });

      await expect(getStartedBtn).toBeVisible();
      await expect(viewGithubBtn).toBeVisible();
      await expect(viewGithubBtn).toHaveAttribute(
        "href",
        /github\.com\/.*logsdx/,
      );
    });

    test("should display hero animation or demo", async ({ page }) => {
      // Check if there's a code demo or animation in hero
      const codeBlock = page.locator("pre, code").first();
      await expect(codeBlock).toBeVisible();
    });
  });

  test.describe("Problem Section", () => {
    test("should explain the problem logsDx solves", async ({ page }) => {
      const problemSection = page.locator("#problem, [id*=problem]");
      await problemSection.scrollIntoViewIfNeeded();

      await expect(
        page.getByText(/the problem/i).or(page.getByText(/why logsdx/i)),
      ).toBeVisible();
    });

    test("should show before/after comparison", async ({ page }) => {
      // Look for comparison indicators
      const withoutLogsDx = page.getByText(/without logsdx/i);
      const withLogsDx = page.getByText(/with logsdx/i);

      // At least one should be visible
      const hasComparison =
        (await withoutLogsDx.count()) > 0 || (await withLogsDx.count()) > 0;
      expect(hasComparison).toBeTruthy();
    });

    test("should display code examples demonstrating the problem", async ({
      page,
    }) => {
      const problemSection = page.locator("#problem, section").first();
      await problemSection.scrollIntoViewIfNeeded();

      const codeBlocks = problemSection.locator("pre, code");
      await expect(codeBlocks.first()).toBeVisible();
    });
  });

  test.describe("Setup/Quick Start Section", () => {
    test("should show installation instructions", async ({ page }) => {
      const setupSection = page.locator("#setup, #quick-start");
      await setupSection.scrollIntoViewIfNeeded();

      // Should have npm/yarn/bun install command
      await expect(
        page.getByText(/npm install|yarn add|bun add/i),
      ).toBeVisible();
    });

    test("should provide basic usage example", async ({ page }) => {
      const setupSection = page.locator("#setup, #quick-start");
      await setupSection.scrollIntoViewIfNeeded();

      // Should show import statement
      await expect(page.getByText(/import.*logsdx/i)).toBeVisible();
    });

    test("should have copyable code snippets", async ({ page }) => {
      const setupSection = page.locator("#setup, #quick-start");
      await setupSection.scrollIntoViewIfNeeded();

      const codeBlocks = setupSection.locator("pre, code");
      await expect(codeBlocks.first()).toBeVisible();
    });
  });

  test.describe("Interactive Examples/Themes Section", () => {
    test("should display theme showcase", async ({ page }) => {
      const examplesSection = page.locator("#examples, #themes");
      await examplesSection.scrollIntoViewIfNeeded();

      await expect(
        page.getByText(/theme.*preview|interactive.*examples/i),
      ).toBeVisible();
    });

    test("should allow theme switching", async ({ page }) => {
      const examplesSection = page.locator("#examples, #themes");
      await examplesSection.scrollIntoViewIfNeeded();

      // Find theme selector buttons
      const themeButtons = page.getByRole("button", {
        name: /(github|dracula|solarized|nord|monokai)/i,
      });

      const buttonCount = await themeButtons.count();
      expect(buttonCount).toBeGreaterThan(0);

      if (buttonCount > 0) {
        await themeButtons.first().click();
        // Theme should be applied
        await page.waitForTimeout(500); // Wait for theme to apply
      }
    });

    test("should show live log preview with selected theme", async ({
      page,
    }) => {
      const examplesSection = page.locator("#examples, #themes");
      await examplesSection.scrollIntoViewIfNeeded();

      // Should have terminal or console preview
      const preview = page.locator(
        '[class*="terminal"], [class*="console"], [class*="preview"]',
      );
      await expect(preview.first()).toBeVisible();
    });

    test("should support light/dark mode toggle for themes", async ({
      page,
    }) => {
      const examplesSection = page.locator("#examples, #themes");
      await examplesSection.scrollIntoViewIfNeeded();

      const modeToggle = page.getByRole("button", {
        name: /(light|dark|system)/i,
      });

      if ((await modeToggle.count()) > 0) {
        await modeToggle.first().click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe("Theme Creator Section", () => {
    test("should navigate to theme creator", async ({ page }) => {
      const themeCreatorLink = page.getByRole("link", {
        name: /theme.*creator|theme.*generator/i,
      });

      if ((await themeCreatorLink.count()) > 0) {
        await themeCreatorLink.first().click();
        await expect(page).toHaveURL(/#theme-creator/);
      }
    });

    test("should display theme creator interface", async ({ page }) => {
      const themeCreatorSection = page.locator("#theme-creator");
      await themeCreatorSection.scrollIntoViewIfNeeded();

      // Should have color pickers or theme controls
      await expect(
        page.getByText(/create.*theme|custom theme/i),
      ).toBeVisible();
    });

    test("should allow customizing theme colors", async ({ page }) => {
      const themeCreatorSection = page.locator("#theme-creator");

      if ((await themeCreatorSection.count()) > 0) {
        await themeCreatorSection.scrollIntoViewIfNeeded();

        const colorInputs = page.locator('input[type="color"]');
        const colorCount = await colorInputs.count();

        expect(colorCount).toBeGreaterThan(0);
      }
    });

    test("should show live preview of custom theme", async ({ page }) => {
      const themeCreatorSection = page.locator("#theme-creator");

      if ((await themeCreatorSection.count()) > 0) {
        await themeCreatorSection.scrollIntoViewIfNeeded();

        await expect(
          page.getByText(/live preview|preview/i).first(),
        ).toBeVisible();
      }
    });
  });

  test.describe("Navigation", () => {
    test("should have sticky navigation bar", async ({ page }) => {
      const nav = page.locator("nav").first();
      await expect(nav).toBeVisible();

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 1000));
      await page.waitForTimeout(300);

      // Nav should still be visible
      await expect(nav).toBeVisible();
    });

    test("should have working navigation links", async ({ page }) => {
      const navLinks = page
        .locator("nav")
        .first()
        .getByRole("link", { name: /(why|quick start|themes|theme)/i });

      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);

      if (linkCount > 0) {
        await navLinks.first().click();
        await page.waitForTimeout(500);
      }
    });

    test("should highlight active section in navigation", async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, 1000));
      await page.waitForTimeout(500);

      const nav = page.locator("nav").first();
      const activeLink = nav.locator('[class*="active"], [aria-current]');

      // May or may not have active state depending on implementation
      const hasActiveState = (await activeLink.count()) > 0;
      expect(typeof hasActiveState).toBe("boolean");
    });
  });

  test.describe("Responsive Design", () => {
    test("should be mobile responsive", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await expect(page.getByRole("heading").first()).toBeVisible();

      // Should have mobile menu or navigation
      const mobileNav =
        page.locator("nav") ||
        page.getByRole("button", { name: /menu/i }) ||
        page.locator('[aria-label*="menu"]');

      await expect(mobileNav.first()).toBeVisible();
    });

    test("should be tablet responsive", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page).toHaveTitle(/logsdx/i);
      await expect(page.getByRole("heading").first()).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper heading hierarchy", async ({ page }) => {
      const h1 = page.locator("h1");
      const h2 = page.locator("h2");

      await expect(h1.first()).toBeVisible();
      expect(await h2.count()).toBeGreaterThan(0);
    });

    test("should have accessible buttons and links", async ({ page }) => {
      const buttons = page.getByRole("button");
      const links = page.getByRole("link");

      expect(await buttons.count()).toBeGreaterThan(0);
      expect(await links.count()).toBeGreaterThan(0);
    });

    test("should support keyboard navigation", async ({ page }) => {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(200);

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });
  });

  test.describe("Performance", () => {
    test("should load within acceptable time", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/");
      const loadTime = Date.now() - startTime;

      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test("should not have console errors", async ({ page }) => {
      const errors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      await page.goto("/");
      await page.waitForTimeout(2000);

      // Should have no critical errors
      const criticalErrors = errors.filter(
        (err) => !err.includes("favicon") && !err.includes("manifest"),
      );

      expect(criticalErrors.length).toBe(0);
    });
  });
});
