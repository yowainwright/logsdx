import { expect, test, describe } from "bun:test";
import { createPrismPlugin } from "./prism";
import type { LogEnhancerPlugin } from "../types";
import type { ReactElement } from "react";
import type { PrismProps } from "./prism";

describe("Prism Plugin", () => {
  test("should enhance code with syntax highlighting", () => {
    const plugin = createPrismPlugin();
    const result = plugin.enhanceLine!("const x = 1;", 0);

    expect(result.props.className).toContain("prism-highlight");
    expect(result.props.className).toContain("language-typescript");
    expect(result.props.dangerouslySetInnerHTML.__html).toContain("token");
  });

  test("should use provided language from context", () => {
    const plugin = createPrismPlugin({ lang: "javascript" });
    const result = plugin.enhanceLine!("const x = 1;", 0, {
      language: "javascript",
    });

    expect(result.props.className).toContain("language-javascript");
    expect(result.props.dangerouslySetInnerHTML.__html).toContain("token");
  });

  test("should use default language when none provided", () => {
    const plugin = createPrismPlugin();
    const result = plugin.enhanceLine!("const x = 1;", 0);

    expect(result.props.className).toContain("language-typescript");
    expect(result.props.dangerouslySetInnerHTML.__html).toContain("token");
  });

  test("should use provided theme", () => {
    const plugin = createPrismPlugin({ theme: "dark" });
    const result = plugin.enhanceLine!("const x = 1;", 0);

    expect(result.props.className).toContain("theme-dark");
  });

  test("should fallback to default theme when none provided", () => {
    const plugin = createPrismPlugin();
    const result = plugin.enhanceLine!("const x = 1;", 0);

    expect(result.props.className).toContain("theme-default");
  });
});
