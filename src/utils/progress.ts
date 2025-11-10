export interface ProgressBar {
  start(total: number, startValue: number): void;
  update(value: number): void;
  stop(): void;
}

export function createProgressBar(total: number): ProgressBar {
  let currentValue = 0;
  let startTime = Date.now();
  let isRunning = false;

  const render = (value: number) => {
    const percentage = Math.floor((value / total) * 100);
    const barLength = 40;
    const filledLength = Math.floor((percentage / 100) * barLength);
    const bar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);
    const elapsed = Date.now() - startTime;
    const duration = `${Math.floor(elapsed / 1000)}s`;

    process.stdout.write(
      `\r ${bar} | ${percentage}% | ${value}/${total} lines | ${duration}`,
    );
  };

  return {
    start(totalValue: number, startValue: number) {
      total = totalValue;
      currentValue = startValue;
      startTime = Date.now();
      isRunning = true;
      render(currentValue);
    },

    update(value: number) {
      if (!isRunning) return;
      currentValue = value;
      render(currentValue);
    },

    stop() {
      if (!isRunning) return;
      isRunning = false;
      process.stdout.write("\n");
    },
  };
}

export default createProgressBar;
