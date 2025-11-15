import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { cleanup } from "@testing-library/react";
import { afterEach } from "bun:test";

// Mock Next.js components
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return <MockThemeProvider>{children}</MockThemeProvider>;
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Cleanup after each test
afterEach(() => {
  cleanup();
});

export * from "@testing-library/react";
export { customRender as render };
