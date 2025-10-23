import { describe, test } from "bun:test";
import { createLexer } from "../../src/tokenizer";
import { getTheme } from "../../src/themes";

describe("Tokenizer Performance Benchmarks", () => {
  const scenarios = [
    {
      name: "Dense matches - many log levels",
      input:
        "[ERROR] Connection failed [WARN] Retrying [INFO] Connected [SUCCESS] Data received",
      description: "Multiple pattern matches in short text",
    },
    {
      name: "Sparse matches - mostly plain text",
      input:
        "Processing data from server without any log level markers present in this very long string that should be batched together efficiently",
      description: "Long text with no matches - tests batching optimization",
    },
    {
      name: "No matches - plain text",
      input: "a".repeat(1000),
      description:
        "1000 characters with no matches - worst case for old implementation",
    },
    {
      name: "Mixed content - realistic log",
      input:
        "2024-01-15 10:30:45 [INFO] User authentication successful for user@example.com - Session ID: abc123def456 - Duration: 152ms",
      description:
        "Realistic log with timestamps, log levels, emails, and numbers",
    },
    {
      name: "Large log line",
      input: "[ERROR] " + "x".repeat(5000) + " Stack trace follows...",
      description: "5000+ character log line with single match at start",
    },
  ];

  for (const scenario of scenarios) {
    test(scenario.name, () => {
      const lexer = createLexer(getTheme("dracula"));

      const start = performance.now();
      const tokens = lexer.tokenize(scenario.input);
      const end = performance.now();

      const timeMs = (end - start).toFixed(3);
      const charsPerToken = (scenario.input.length / tokens.length).toFixed(1);

      console.log(`\n${scenario.name}:`);
      console.log(`  Description: ${scenario.description}`);
      console.log(`  Input length: ${scenario.input.length} chars`);
      console.log(`  Time: ${timeMs}ms`);
      console.log(`  Tokens created: ${tokens.length}`);
      console.log(`  Chars/token: ${charsPerToken}`);
      console.log(
        `  Throughput: ${((scenario.input.length / parseFloat(timeMs)) * 1000).toFixed(0)} chars/sec`,
      );
    });
  }

  test("Batch processing - 1000 lines", () => {
    const lexer = createLexer(getTheme("dracula"));
    const lines = Array(1000).fill(
      "[INFO] Processing request from 192.168.1.1 - Status: 200 OK",
    );

    const start = performance.now();
    let totalTokens = 0;
    for (const line of lines) {
      const tokens = lexer.tokenize(line);
      totalTokens += tokens.length;
    }
    const end = performance.now();

    const timeMs = (end - start).toFixed(3);
    const linesPerSec = ((1000 / parseFloat(timeMs)) * 1000).toFixed(0);

    console.log(`\nBatch processing - 1000 lines:`);
    console.log(`  Time: ${timeMs}ms`);
    console.log(`  Total tokens: ${totalTokens}`);
    console.log(`  Throughput: ${linesPerSec} lines/sec`);
  });
});
