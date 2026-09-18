import type { ThemeColors } from "./types";

interface ThemePreviewProps {
  processedLogs: string[];
  isProcessing: boolean;
  colors: ThemeColors;
}

function PreviewLogLines({
  logs,
  prefix,
}: {
  logs: string[];
  prefix: string;
}) {
  return (
    <>
      {logs.map((log, index) => (
        <div
          key={`${prefix}-${index}`}
          className="log-line"
          dangerouslySetInnerHTML={{ __html: log }}
        />
      ))}
    </>
  );
}

function ProcessingMessage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center opacity-50">Processing logs...</div>
    </div>
  );
}

function EmptyPreview() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center opacity-50">No logs to display</div>
    </div>
  );
}

function PreviewContent({
  isProcessing,
  processedLogs,
}: Pick<ThemePreviewProps, "isProcessing" | "processedLogs">) {
  if (isProcessing) return <ProcessingMessage />;
  if (processedLogs.length === 0) return <EmptyPreview />;

  return (
    <div className="log-scroll-wrapper">
      <PreviewLogLines logs={processedLogs} prefix="log-1" />
      <PreviewLogLines logs={processedLogs} prefix="log-2" />
    </div>
  );
}

function PreviewStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
              @keyframes scroll-up-continuous {
                from { transform: translateY(0); }
                to { transform: translateY(-50%); }
              }
              .log-scroll-wrapper {
                display: flex;
                flex-direction: column;
                animation: scroll-up-continuous 40s linear infinite;
              }
              .log-scroll-wrapper:hover {
                animation-play-state: paused;
              }
              .log-line {
                padding: 4px 16px;
                line-height: 1.6;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            `,
      }}
    />
  );
}

export function ThemePreview({
  processedLogs,
  isProcessing,
  colors,
}: ThemePreviewProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Live Preview</h3>
        <span className="text-xs text-muted-foreground">Powered by LogsDX</span>
      </div>
      <div
        className="font-mono text-sm rounded-lg overflow-hidden h-[400px] relative"
        style={{
          backgroundColor: colors.background,
          color: colors.text,
          border: `1px solid ${colors.muted}`,
        }}
      >
        <PreviewStyles />
        <div className="h-full overflow-hidden relative">
          <PreviewContent
            isProcessing={isProcessing}
            processedLogs={processedLogs}
          />
        </div>
      </div>
    </div>
  );
}
