import type { ThemeColors } from "@/types/theme";

interface ThemePreviewProps {
  processedLogs: string[];
  isProcessing: boolean;
  colors: ThemeColors;
}

export function ThemePreview({ processedLogs, isProcessing, colors }: ThemePreviewProps) {
  const duplicatedLogs = [...processedLogs, ...processedLogs];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Preview</h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">Powered by LogsDX</span>
      </div>
      <div
        className="relative overflow-hidden rounded-lg border font-mono text-sm p-4 min-h-[300px]"
        style={{
          background: colors.background,
          color: colors.text,
          borderColor: colors.border,
        }}
      >
        {isProcessing && (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-500">Processing logs...</span>
          </div>
        )}
        {!isProcessing && processedLogs.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-500">No logs to display</span>
          </div>
        )}
        {!isProcessing && processedLogs.length > 0 && (
          <div className="log-scroll-wrapper">
            <style jsx>{`
              .log-scroll-wrapper:hover .log-line {
                animation-play-state: paused;
              }
            `}</style>
            {duplicatedLogs.map((log, index) => (
              <div
                key={index}
                className="log-line mb-1"
                dangerouslySetInnerHTML={{ __html: log }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
