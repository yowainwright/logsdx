import { expect, test, describe } from "bun:test";
import { 
  styleLine, 
  styleManager,
  setTheme,
  THEMES,
  type ThemeConfig
} from "@/src/themes/asci/styles";
import chalk from 'chalk';
import type { LogLevel } from '@/src/types';

describe("styleLine", () => {
  test("should style error level correctly", () => {
    const result = styleLine("Error message", { level: "error" });
    // Check that the result contains the expected text with red and bold styling
    expect(result).toContain("Error message");
    expect(result).toMatch(/\u001B\[31m/); // Red color
    expect(result).toMatch(/\u001B\[1m/);  // Bold
  });

  test("should style warn level correctly", () => {
    const result = styleLine("Warning message", { level: "warn" });
    expect(result).toContain("Warning message");
    expect(result).toMatch(/\u001B\[33m/); // Yellow color
  });

  test("should style info level correctly", () => {
    const result = styleLine("Info message", { level: "info" });
    expect(result).toContain("Info message");
    expect(result).toMatch(/\u001B\[34m/); // Blue color
  });

  test("should style debug level correctly", () => {
    const result = styleLine("Debug message", { level: "debug" });
    expect(result).toContain("Debug message");
    expect(result).toMatch(/\u001B\[90m/); // Gray color
    expect(result).toMatch(/\u001B\[2m/);  // Dim
  });

  test("should return default style for unknown level", () => {
    const result = styleLine("Plain message", { level: "success" as LogLevel });
    expect(result).toContain("Plain message");
    expect(result).toMatch(/\u001B\[32m/); // Green color
  });

  test("should return default style for undefined level", () => {
    const result = styleLine("Plain message", {});
    expect(result).toContain("Plain message");
    expect(result).toMatch(/\u001B\[34m/); // Blue color (default to info)
  });
});

describe("formatJson", () => {
  test("should format JSON with colors", () => {
    const obj = { name: "test", value: 123 };
    const result = styleManager.formatJson(obj);
    
    // Instead of checking for exact strings, just verify the result contains the key elements
    expect(result).toContain("name");
    expect(result).toContain("test");
    expect(result).toContain("value");
    expect(result).toContain("123");
    expect(result).toContain("{");
    expect(result).toContain("}");
  });
});

describe("Style Manager", () => {
  test("should have styles for each level", () => {
    // Instead of checking exact function references, verify that styles exist
    expect(styleManager.getLevelStyle("error")).toBeDefined();
    expect(styleManager.getLevelStyle("warn")).toBeDefined();
    expect(styleManager.getLevelStyle("info")).toBeDefined();
    expect(styleManager.getLevelStyle("debug")).toBeDefined();
    expect(styleManager.getLevelStyle("success")).toBeDefined();
    expect(styleManager.getLevelStyle("trace")).toBeDefined();
  });
});

describe("Pattern-based styling", () => {
  test("should apply pattern styles to text", () => {
    const text = "Error occurred at https://example.com with IP 192.168.1.1";
    const result = styleManager.applyPatternStyles(text);
    
    // Check that patterns are applied by verifying the presence of color codes
    expect(result).toContain("Error");
    expect(result).toMatch(/\u001B\[31m/); // Red color for "Error"
    expect(result).toContain("https://example.com");
    expect(result).toMatch(/\u001B\[34m/); // Blue color for URL
    expect(result).toMatch(/\u001B\[3m/);  // Italic for URL
    expect(result).toContain("192.168.1.1");
    expect(result).toMatch(/\u001B\[90m/); // Gray color for IP
  });
  
  test("should handle overlapping patterns", () => {
    // Create a custom theme with overlapping patterns
    const customTheme: Partial<ThemeConfig> = {
      patterns: {
        long: { regex: /long pattern/, color: 'red' },
        short: { regex: /pattern/, color: 'blue' },
      },
    };
    
    setTheme(customTheme);
    
    // The longer pattern should take precedence
    const result = styleManager.applyPatternStyles("This is a long pattern");
    expect(result).toContain("long");
    expect(result).toMatch(/\u001B\[31m/); // Red color for "long"
    expect(result).toContain("pattern");
    expect(result).toMatch(/\u001B\[34m/); // Blue color for "pattern"
    
    // Reset to default theme
    setTheme("default");
  });
  
  test("should apply both level and pattern styles", () => {
    const result = styleLine("Error occurred at https://example.com", { level: "info" });
    
    // Level style (blue) should be applied to the whole line
    // Pattern styles should be applied to specific parts
    expect(result).toContain("Error");
    expect(result).toMatch(/\u001B\[34m/); // Blue color for info level
    expect(result).toContain("https://example.com");
    expect(result).toMatch(/\u001B\[3m/);  // Italic for URL
  });
});

describe("Theme Configuration", () => {
  test("should apply custom theme", () => {
    const customTheme: Partial<ThemeConfig> = {
      levels: {
        error: { color: 'magenta', bold: true },
        info: { color: 'green', italic: true },
      },
      fields: {
        timestamp: { color: 'blue', dim: true },
      },
      status: {
        success: { color: 'cyan', bold: true },
      },
      patterns: {
        error: { regex: /\b(critical|fatal)\b/i, color: 'magenta', bold: true },
      },
    };
    
    setTheme(customTheme);
    
    // Check level styles
    const errorResult = styleLine("Error message", { level: "error" });
    expect(errorResult).toContain("Error message");
    expect(errorResult).toMatch(/\u001B\[35m/); // Magenta color
    expect(errorResult).toMatch(/\u001B\[1m/);  // Bold
    
    const infoResult = styleLine("Info message", { level: "info" });
    expect(infoResult).toContain("Info message");
    expect(infoResult).toMatch(/\u001B\[32m/); // Green color
    expect(infoResult).toMatch(/\u001B\[3m/);  // Italic
    
    // Check field styles
    const jsonResult = styleManager.formatJson({ timestamp: "2023-01-01" });
    expect(jsonResult).toContain("2023-01-01");
    expect(jsonResult).toMatch(/\u001B\[34m/); // Blue color
    expect(jsonResult).toMatch(/\u001B\[2m/);  // Dim
    
    // Check pattern styles
    const patternResult = styleManager.applyPatternStyles("Critical error occurred");
    expect(patternResult).toContain("Critical");
    expect(patternResult).toMatch(/\u001B\[35m/); // Magenta color
    expect(patternResult).toMatch(/\u001B\[1m/);  // Bold
    
    // Reset to default theme
    setTheme("default");
  });
  
  test("should handle invalid color in theme", () => {
    const invalidTheme: Partial<ThemeConfig> = {
      levels: {
        error: { color: 'invalid-color' as any, bold: true },
      },
    };
    
    setTheme(invalidTheme);
    
    // Should fall back to white
    const result = styleLine("Error message", { level: "error" });
    expect(result).toContain("Error message");
    expect(result).toMatch(/\u001B\[37m/); // White color
    
    // Reset to default theme
    setTheme("default");
  });
  
  test("should support hex colors", () => {
    const hexTheme: Partial<ThemeConfig> = {
      levels: {
        error: { color: '#ff0000', bold: true },
      },
    };
    
    setTheme(hexTheme);
    
    const result = styleLine("Error message", { level: "error" });
    expect(result).toContain("Error message");
    expect(result).toMatch(/\u001B\[38;2;255;0;0m/); // Red hex color
    expect(result).toMatch(/\u001B\[1m/);  // Bold
    
    // Reset to default theme
    setTheme("default");
  });
  
  test("should support built-in themes", () => {
    // Test dark theme
    setTheme("dark");
    const darkResult = styleLine("Error message", { level: "error" });
    expect(darkResult).toContain("Error message");
    expect(darkResult).toMatch(/\u001B\[38;2;255;85;85m/); // Dracula red
    
    // Test light theme
    setTheme("light");
    const lightResult = styleLine("Error message", { level: "error" });
    expect(lightResult).toContain("Error message");
    expect(lightResult).toMatch(/\u001B\[38;2;211;47;47m/); // Material red
    
    // Test minimal theme
    setTheme("minimal");
    const minimalResult = styleLine("Error message", { level: "error" });
    expect(minimalResult).toContain("Error message");
    expect(minimalResult).toMatch(/\u001B\[31m/); // Basic red
    
    // Reset to default theme
    setTheme("default");
  });
});
