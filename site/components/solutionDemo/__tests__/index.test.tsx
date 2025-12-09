import { describe, test, expect, afterEach } from "bun:test";
import { render, screen, cleanup } from "@/tests/utils/test-utils";
import { ProblemSection } from "../index";

describe("ProblemSection", () => {
  afterEach(cleanup);

  test("renders problem description", () => {
    render(<ProblemSection />);

    expect(screen.getByText(/The Problem/)).toBeTruthy();
    expect(screen.getAllByText(/logsDx/).length).toBeGreaterThan(0);
  });

  test("renders toggle badge", () => {
    const { container } = render(<ProblemSection />);

    const badge = container.querySelector('[class*="pointer-events-none"]');
    expect(badge?.textContent).toMatch(/Without logsDx|With logsDx/);
  });

  test("renders terminal and browser panes", () => {
    const { container } = render(<ProblemSection />);

    const content = container.textContent || "";
    expect(content).toContain("Terminal");
    expect(content).toContain("Browser");
  });

  test("renders demo logs in both panes", () => {
    const { container } = render(<ProblemSection />);

    const terminalLogs = container.querySelectorAll('[class*="font-mono"]');
    expect(terminalLogs.length).toBeGreaterThan(0);

    const content = container.textContent || "";
    expect(content).toContain("[INFO]");
    expect(content).toContain("[ERROR]");
    expect(content).toContain("[WARN]");
  });

  test("renders code comparison", () => {
    const { container } = render(<ProblemSection />);

    const codeElements = container.querySelectorAll("code");
    expect(codeElements.length).toBeGreaterThan(0);

    const codeText = container.textContent || "";
    expect(codeText).toContain("console.log");
  });

  test("renders clickable card", () => {
    const { container } = render(<ProblemSection />);

    const card = container.querySelector('[class*="cursor-pointer"]');
    expect(card).toBeTruthy();

    const badge = container.querySelector('[class*="pointer-events-none"]');
    expect(badge?.textContent).toMatch(/Without logsDx|With logsDx/);
  });

  test("shows status indicators", () => {
    const { container } = render(<ProblemSection />);

    const statusText = container.textContent || "";
    expect(statusText).toContain("Terminal");
    expect(statusText).toContain("Browser");
  });
});
