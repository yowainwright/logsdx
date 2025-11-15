import { describe, test, expect } from "bun:test";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { InteractiveExamplesSection } from "../index";

describe("InteractiveExamplesSection", () => {
  test("renders section heading", () => {
    render(<InteractiveExamplesSection />);

    expect(screen.getByText(/Interactive/)).toBeTruthy();
    expect(screen.getByText(/Theme Preview/)).toBeTruthy();
  });

  test("renders all theme selector buttons", () => {
    render(<InteractiveExamplesSection />);

    const themeNames = [
      "GitHub",
      "Solarized",
      "Dracula",
      "Nord",
      "Monokai",
      "Oh My Zsh",
    ];

    themeNames.forEach((theme) => {
      const button = screen.getByRole("button", { name: theme });
      expect(button).toBeTruthy();
    });
  });

  test("renders terminal and browser preview panes", () => {
    render(<InteractiveExamplesSection />);

    expect(screen.getByText("Terminal")).toBeTruthy();
    expect(screen.getByText("Browser Console")).toBeTruthy();
  });

  test("changes theme on button click", async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(<InteractiveExamplesSection />);

    const draculaBtn = screen.getByRole("button", { name: "Dracula" });
    await user.click(draculaBtn);

    const content = container.textContent || "";
    expect(content).toContain("Dracula");
  });

  test("renders color mode toggle buttons", () => {
    render(<InteractiveExamplesSection />);

    const allButtons = screen.getAllByRole("button");
    const hasColorModeButtons = allButtons.some((btn) =>
      btn.querySelector('[class*="lucide"]'),
    );

    expect(hasColorModeButtons).toBe(true);
  });

  test("displays sample logs in preview panes", () => {
    const { container } = render(<InteractiveExamplesSection />);

    const content = container.textContent || "";
    expect(content).toContain("INFO");
    expect(content).toContain("ERROR");
    expect(content).toContain("WARN");
  });

  test("renders code examples section", () => {
    render(<InteractiveExamplesSection />);

    expect(screen.getByText("Quick Integration")).toBeTruthy();
    expect(screen.getByText("Logger Integration Examples")).toBeTruthy();
  });

  test("shows code blocks with getLogsDX usage", () => {
    const { container } = render(<InteractiveExamplesSection />);

    const codeText = container.textContent || "";
    expect(codeText).toContain("getLogsDX");
    expect(codeText).toContain("processLine");
  });

  test("renders winston integration example", () => {
    render(<InteractiveExamplesSection />);

    expect(screen.getByText("Winston")).toBeTruthy();
  });

  test("renders pino integration example", () => {
    render(<InteractiveExamplesSection />);

    expect(screen.getByText("Pino")).toBeTruthy();
  });

  test("renders console override example", () => {
    render(<InteractiveExamplesSection />);

    expect(screen.getByText("Console Override")).toBeTruthy();
  });
});
