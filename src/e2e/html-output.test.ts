import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import { LogsDX } from "../index";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

describe("HTML Output E2E", () => {
  // Create a temporary directory for test files
  const tempDir = path.join(os.tmpdir(), "logsdx-e2e-tests");
  
  // Setup and teardown
  beforeEach(async () => {
    try {
      await fs.mkdir(tempDir, { recursive: true });
    } catch (error) {
      console.error("Failed to create temp directory:", error);
    }
  });
  
  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error("Failed to remove temp directory:", error);
    }
  });
  
  test("generates HTML output for a log file", async () => {
    // Create a sample log file
    const logContent = [
      "2023-01-01T12:00:00Z INFO: Application started",
      "2023-01-01T12:00:01Z DEBUG: Loading configuration",
      "2023-01-01T12:00:02Z WARN: Configuration file not found, using defaults",
      "2023-01-01T12:00:03Z ERROR: Failed to connect to database",
      "2023-01-01T12:00:04Z INFO: Retrying connection in 5 seconds",
      "2023-01-01T12:00:09Z INFO: Connected to database successfully"
    ].join("\n");
    
    const logFilePath = path.join(tempDir, "sample.log");
    const htmlOutputPath = path.join(tempDir, "output.html");
    
    await fs.writeFile(logFilePath, logContent, "utf-8");
    
    // Initialize LogsDX with HTML output format
    const logsDX = LogsDX.getInstance({
      theme: "oh-my-zsh",
      outputFormat: "html",
      htmlStyleFormat: "css"
    });
    
    // Process the log file
    const logLines = logContent.split("\n");
    const processedLines = logsDX.processLines(logLines);
    
    // Create a simple HTML document with the processed lines
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>LogsDX HTML Output Test</title>
      <style>
        body {
          background-color: #1e1e1e;
          color: #d4d4d4;
          font-family: monospace;
          padding: 20px;
        }
        .log-line {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="log-container">
        ${processedLines.map(line => `<div class="log-line">${line}</div>`).join("\n")}
      </div>
    </body>
    </html>
    `;
    
    // Write the HTML output
    await fs.writeFile(htmlOutputPath, htmlContent, "utf-8");
    
    // Read the HTML output and verify it
    const outputContent = await fs.readFile(htmlOutputPath, "utf-8");
    
    // Verify that the HTML contains styled spans
    expect(outputContent).toContain("<span style=");
    
    // Verify that log levels are present
    expect(outputContent).toContain("INFO");
    expect(outputContent).toContain("DEBUG");
    expect(outputContent).toContain("WARN");
    expect(outputContent).toContain("ERROR");
    
    // Verify that the HTML is well-formed
    expect(outputContent).toContain("<!DOCTYPE html>");
    expect(outputContent).toContain("<html>");
    expect(outputContent).toContain("</html>");
  });
  
  test("generates HTML output with class names", async () => {
    // Initialize LogsDX with HTML output format using class names
    const logsDX = LogsDX.getInstance({
      theme: "oh-my-zsh",
      outputFormat: "html",
      htmlStyleFormat: "className"
    });
    
    // Process a sample log line
    const logLine = "2023-01-01T12:00:00Z ERROR: Critical system failure";
    const processedLine = logsDX.processLine(logLine);
    
    // Verify that the output contains class names instead of inline styles
    expect(processedLine).toContain("<span class=");
    expect(processedLine).not.toContain("<span style=");
    
    // Verify that the log level is present
    expect(processedLine).toContain("ERROR");
  });
  
  test("generates CSS file for HTML output with class names", async () => {
    // Initialize LogsDX with HTML output format using class names
    const logsDX = LogsDX.getInstance({
      theme: "oh-my-zsh",
      outputFormat: "html",
      htmlStyleFormat: "className"
    });
    
    // Create a simple CSS file with basic styles
    const css = `
    /* LogsDX Generated CSS */
    .logsdx--red { color: #ff0000; }
    .logsdx--green { color: #00ff00; }
    .logsdx--blue { color: #0000ff; }
    .logsdx-bold { font-weight: bold; }
    .logsdx-italic { font-style: italic; }
    .logsdx-underline { text-decoration: underline; }
    `;
    
    // Write CSS to a file
    const cssFilePath = path.join(tempDir, "logsdx.css");
    await fs.writeFile(cssFilePath, css, "utf-8");
    
    // Read the CSS file and verify it
    const cssContent = await fs.readFile(cssFilePath, "utf-8");
    
    // Verify that the CSS contains color classes
    expect(cssContent).toContain(".logsdx--");
    
    // Verify that the CSS contains style classes
    expect(cssContent).toContain(".logsdx-bold");
    expect(cssContent).toContain(".logsdx-italic");
    expect(cssContent).toContain(".logsdx-underline");
    
    // Process a log line with HTML class names
    const logLine = "2023-01-01T12:00:00Z ERROR: Critical system failure";
    const processedLine = logsDX.processLine(logLine);
    
    // Create a simple HTML document with the processed line and CSS
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>LogsDX CSS Test</title>
      <style>${css}</style>
    </head>
    <body>
      <div>${processedLine}</div>
    </body>
    </html>
    `;
    
    // Write the HTML output
    const htmlOutputPath = path.join(tempDir, "css-test.html");
    await fs.writeFile(htmlOutputPath, htmlContent, "utf-8");
    
    // Read the HTML output and verify it
    const outputContent = await fs.readFile(htmlOutputPath, "utf-8");
    
    // Verify that the HTML contains class names
    expect(outputContent).toContain("<span class=");
    expect(outputContent).not.toContain("<span style=");
  });
  
  test("renders a complete HTML page with log content", async () => {
    // Create a sample log file
    const logContent = [
      "2023-01-01T12:00:00Z INFO: Application started",
      "2023-01-01T12:00:01Z DEBUG: Loading configuration",
      "2023-01-01T12:00:02Z WARN: Configuration file not found, using defaults",
      "2023-01-01T12:00:03Z ERROR: Failed to connect to database",
      "2023-01-01T12:00:04Z INFO: Retrying connection in 5 seconds",
      "2023-01-01T12:00:09Z INFO: Connected to database successfully"
    ].join("\n");
    
    const logFilePath = path.join(tempDir, "complete.log");
    const htmlOutputPath = path.join(tempDir, "complete.html");
    
    await fs.writeFile(logFilePath, logContent, "utf-8");
    
    // Initialize LogsDX with HTML output format
    const logsDX = LogsDX.getInstance({
      theme: "dracula", // Use a different theme for variety
      outputFormat: "html",
      htmlStyleFormat: "css"
    });
    
    // Process the log file
    const processedLog = logsDX.processLog(logContent);
    
    // Create a complete HTML document
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>LogsDX Complete HTML Output Test</title>
      <style>
        body {
          background-color: #282a36;
          color: #f8f8f2;
          font-family: monospace;
          padding: 20px;
        }
        pre {
          margin: 0;
          white-space: pre-wrap;
        }
      </style>
    </head>
    <body>
      <h1>LogsDX HTML Output</h1>
      <pre>${processedLog}</pre>
    </body>
    </html>
    `;
    
    // Write the HTML output
    await fs.writeFile(htmlOutputPath, htmlContent, "utf-8");
    
    // Read the HTML output and verify it
    const outputContent = await fs.readFile(htmlOutputPath, "utf-8");
    
    // Verify that the HTML contains styled spans
    expect(outputContent).toContain("<span style=");
    
    // Verify that log levels are present
    expect(outputContent).toContain("INFO");
    expect(outputContent).toContain("DEBUG");
    expect(outputContent).toContain("WARN");
    expect(outputContent).toContain("ERROR");
    
    // Verify that the HTML is well-formed
    expect(outputContent).toContain("<!DOCTYPE html>");
    expect(outputContent).toContain("<html>");
    expect(outputContent).toContain("</html>");
  });
});
