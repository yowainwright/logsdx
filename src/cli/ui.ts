import boxen from "../utils/boxen";
import spinner from "../utils/spinner";
import colors from "../utils/colors";
import ascii from "../utils/ascii";
import gradient from "../utils/gradient";
import { createProgressBar } from "../utils/progress";
import { createLogger } from "../utils/logger";
import { UI_LABELS, SIZE_UNITS, SIZE_UNIT_MULTIPLIER } from "./constants";
import type { Spinner } from "../utils/types";
import { SpinnerLike, ProgressBarLike } from "./types";

const log = createLogger("ui");

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
    const title = ascii.textSync("LogsDX");
    const gradientTitle = gradient()(title);
    const box = boxen(gradientTitle, {
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "cyan",
      backgroundColor: "black",
    });
    log.info(box);
  }

  showSuccess(message: string) {
    const label = colors.green(UI_LABELS.ok);
    const text = colors.bold(message);
    log.success(`${label} ${text}`);
  }

  showError(message: string, suggestion?: string) {
    const label = colors.red(UI_LABELS.error);
    const text = colors.bold.red(message);
    log.error(`${label} ${text}`);
    if (!suggestion) return;
    const hint = colors.yellow(`  ${UI_LABELS.hint}`);
    const suggestionText = colors.italic(suggestion);
    log.warn(`${hint} ${suggestionText}`);
  }

  showWarning(message: string) {
    const label = colors.yellow(UI_LABELS.warn);
    const text = colors.bold.yellow(message);
    log.warn(`${label} ${text}`);
  }

  showInfo(message: string) {
    const label = colors.blue(UI_LABELS.info);
    log.info(`${label} ${message}`);
  }

  showThemePreview(themeName: string, sample: string) {
    const title = colors.bold.cyan(themeName);
    const box = boxen(sample, {
      title,
      padding: 1,
      margin: { top: 0, bottom: 1, left: 2, right: 2 },
      borderStyle: "single",
      borderColor: "gray",
    });
    log.info(box);
  }

  showFileStats(filename: string, lineCount: number, fileSize: number) {
    const fileLabel = `${UI_LABELS.file} ${colors.cyan(filename)}`;
    const lineLabel = `${UI_LABELS.lines} ${colors.yellow(lineCount.toLocaleString())}`;
    const sizeLabel = `${UI_LABELS.size} ${colors.green(this.formatFileSize(fileSize))}`;
    const stats = [fileLabel, lineLabel, sizeLabel].join("  ");
    const box = boxen(stats, {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: 1, bottom: 1, left: 0, right: 0 },
      borderStyle: "single",
      borderColor: "blue",
    });
    log.info(box);
  }

  private formatFileSize(bytes: number): string {
    let size = bytes;
    let unitIndex = 0;
    const maxIndex = SIZE_UNITS.length - 1;

    while (size >= SIZE_UNIT_MULTIPLIER && unitIndex < maxIndex) {
      size /= SIZE_UNIT_MULTIPLIER;
      unitIndex++;
    }

    const unit = SIZE_UNITS[unitIndex];
    return `${size.toFixed(1)} ${unit}`;
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
