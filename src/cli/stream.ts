import { createReadStream } from "fs";
import { createInterface } from "readline";
import type { LogsDX } from "../index";

export interface StreamOptions {
  quiet?: boolean;
  output?: string;
  onLine?: (processedLine: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export async function processFileStream(
  filePath: string,
  logsDX: LogsDX,
  options: StreamOptions = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const fileStream = createReadStream(filePath, {
      encoding: "utf8",
      highWaterMark: 64 * 1024, // 64KB chunks
    });

    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const outputLines: string[] = [];

    rl.on("line", (line) => {
      try {
        const processedLine = logsDX.processLine(line);

        if (options.output) {
          outputLines.push(processedLine);
        } else if (!options.quiet) {
          console.log(processedLine);
        }

        if (options.onLine) {
          options.onLine(processedLine);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (options.onError) {
          options.onError(err);
        }
      }
    });

    rl.on("close", () => {
      if (options.output && outputLines.length > 0) {
        const fs = require("fs");
        fs.writeFileSync(options.output, outputLines.join("\n"));
      }

      if (options.onComplete) {
        options.onComplete();
      }

      resolve();
    });

    rl.on("error", (error) => {
      if (options.onError) {
        options.onError(error);
      }
      reject(error);
    });

    fileStream.on("error", (error) => {
      if (options.onError) {
        options.onError(error);
      }
      reject(error);
    });
  });
}

export async function processStdinStream(
  logsDX: LogsDX,
  options: StreamOptions = {},
): Promise<void> {
  return new Promise((resolve) => {
    process.stdin.setEncoding("utf8");

    const rl = createInterface({
      input: process.stdin,
      crlfDelay: Infinity,
    });

    const outputLines: string[] = [];

    rl.on("line", (line) => {
      try {
        if (line.trim()) {
          const processedLine = logsDX.processLine(line);

          if (options.output) {
            outputLines.push(processedLine);
          } else if (!options.quiet) {
            console.log(processedLine);
          }

          if (options.onLine) {
            options.onLine(processedLine);
          }
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (options.onError) {
          options.onError(err);
        }
      }
    });

    rl.on("close", () => {
      if (options.output && outputLines.length > 0) {
        const fs = require("fs");
        fs.writeFileSync(options.output, outputLines.join("\n"));
      }

      if (options.onComplete) {
        options.onComplete();
      }

      resolve();
    });
  });
}
