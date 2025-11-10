import boxen from "../utils/boxen";
import spinner, { type Spinner } from "../utils/spinner";
import colors from "../utils/colors";
import ascii from "../utils/ascii";
import gradient from "../utils/gradient";
import { createProgressBar } from "../utils/progress";
import { SpinnerLike, ProgressBarLike } from "./types";

export class CliUI {
  private spinner?: Spinner;
  private progressBar?: ProgressBarLike;

  createSpinner(text: string, disabled = false): SpinnerLike {
    if (disabled) {
      const mockSpinner: SpinnerLike = {
        start: () => mockSpinner,
        succeed: () => mockSpinner,
        fail: () => mockSpinner,
        stop: () => mockSpinner,
        text,
      };
      return mockSpinner;
    }

    this.spinner = spinner(text);
    return this.spinner;
  }

  createProgressBar(total: number, disabled = false): ProgressBarLike {
    if (disabled) {
      return {
        start: () => {},
        update: () => {},
        stop: () => {},
      };
    }

    this.progressBar = createProgressBar(total);
    return this.progressBar;
  }

  showHeader() {
    const title = ascii.textSync("LogsDX", {
      font: "Small",
      horizontalLayout: "default",
      verticalLayout: "default",
    });

    const gradientTitle = gradient([
      "#42d392",
      "#647eff",
      "#A463BF",
      "#bf6399",
    ])(title);

    console.log(
      boxen(gradientTitle, {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
        backgroundColor: "black",
      }),
    );
  }

  showSuccess(message: string) {
    console.log(colors.green("✅"), colors.bold(message));
  }

  showError(message: string, suggestion?: string) {
    console.log(colors.red("❌"), colors.bold.red("Error:"), message);
    if (suggestion) {
      console.log(colors.yellow("💡"), colors.italic(suggestion));
    }
  }

  showWarning(message: string) {
    console.log(colors.yellow("⚠️"), colors.bold.yellow("Warning:"), message);
  }

  showInfo(message: string) {
    console.log(colors.blue("ℹ️"), message);
  }

  showThemePreview(themeName: string, sample: string) {
    const box = boxen(sample, {
      title: colors.bold.cyan(themeName),
      padding: 1,
      margin: { top: 0, bottom: 1, left: 2, right: 2 },
      borderStyle: "single",
      borderColor: "gray",
    });
    console.log(box);
  }

  showFileStats(filename: string, lineCount: number, fileSize: number) {
    const stats = [
      `📄 File: ${colors.cyan(filename)}`,
      `📊 Lines: ${colors.yellow(lineCount.toLocaleString())}`,
      `📐 Size: ${colors.green(this.formatFileSize(fileSize))}`,
    ].join("  ");

    console.log(
      boxen(stats, {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        margin: { top: 1, bottom: 1, left: 0, right: 0 },
        borderStyle: "single",
        borderColor: "blue",
      }),
    );
  }

  private formatFileSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  cleanup() {
    if (this.spinner) {
      this.spinner.stop();
    }
    if (this.progressBar) {
      this.progressBar.stop();
    }
  }
}

export const ui = new CliUI();
