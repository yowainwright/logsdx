import { expect, test, describe } from "bun:test";
import { createShikiPlugin } from "./shiki";
import type { LogEnhancerPlugin } from "../types";
import type { ReactElement } from "react";
import type { ShikiProps } from "./shiki";

describe("Shiki Plugin", () => {
  test("should enhance code with syntax highlighting", async () => {
    const plugin = createShikiPlugin() as LogEnhancerPlugin<
      ReactElement<ShikiProps>
    > & { init: () => Promise<void> };
    await plugin.init();

    const result = plugin.enhanceLine!("const x = 1;", 0);
    expect(result.props.className).toBe("shiki");
    expect(result.props.dangerouslySetInnerHTML.__html).toContain(
      "github-dark",
    );
  });

  test("should use provided language from context", async () => {
    const plugin = createShikiPlugin({
      lang: "javascript",
    }) as LogEnhancerPlugin<ReactElement<ShikiProps>> & {
      init: () => Promise<void>;
    };
    await plugin.init();

    const result = plugin.enhanceLine!("const x = 1;", 0, {
      language: "javascript",
    });
    expect(result.props.dangerouslySetInnerHTML.__html).toContain(
      "shiki-themes",
    );
  });

  test("should use default language when none provided", async () => {
    const plugin = createShikiPlugin() as LogEnhancerPlugin<
      ReactElement<ShikiProps>
    > & { init: () => Promise<void> };
    await plugin.init();

    const result = plugin.enhanceLine!("const x = 1;", 0);
    expect(result.props.dangerouslySetInnerHTML.__html).toContain(
      "shiki-themes",
    );
  });
});
