import chalk from "chalk";
import boxen from "boxen";
import figlet from "figlet";
import gradient from "gradient-string";
import ora, { type Ora } from "ora";
import { SingleBar, Presets } from "cli-progress";
import { SpinnerLike, ProgressBarLike } from "./types";

export class CliUI {
  private spinner?: Ora;
  private progressBar?: SingleBar;

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

    this.spinner = ora({
      text,
      spinner: "dots",
      color: "cyan",
    });
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

    this.progressBar = new SingleBar(
      {
        format:
          " {bar} | {percentage}% | {value}/{total} lines | {duration_formatted}",
        barCompleteChar: "█",
        barIncompleteChar: "░",
        hideCursor: true,
      },
      Presets.shades_classic,
    );

    this.progressBar.start(total, 0);
    return this.progressBar;
  }

  showHeader() {
    const title = figlet.textSync("LogsDX", {
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
    console.log(chalk.green("✅"), chalk.bold(message));
  }

  showError(message: string, suggestion?: string) {
    console.log(chalk.red("❌"), chalk.bold.red("Error:"), message);
    if (suggestion) {
      console.log(chalk.yellow("💡"), chalk.italic(suggestion));
    }
  }

  showWarning(message: string) {
    console.log(chalk.yellow("⚠️"), chalk.bold.yellow("Warning:"), message);
  }

  showInfo(message: string) {
    console.log(chalk.blue("ℹ️"), message);
  }

  showThemePreview(themeName: string, sample: string) {
    const box = boxen(sample, {
      title: chalk.bold.cyan(themeName),
      padding: 1,
      margin: { top: 0, bottom: 1, left: 2, right: 2 },
      borderStyle: "single",
      borderColor: "gray",
    });
    console.log(box);
  }

  showFileStats(filename: string, lineCount: number, fileSize: number) {
    const stats = [
      `📄 File: ${chalk.cyan(filename)}`,
      `📊 Lines: ${chalk.yellow(lineCount.toLocaleString())}`,
      `📐 Size: ${chalk.green(this.formatFileSize(fileSize))}`,
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
