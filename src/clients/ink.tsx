import React from 'react';
import { render, Text, Box } from 'ink';
import { LogEnhancer } from '../';

interface InkLogViewerProps {
  log: string;
  enhancer: LogEnhancer;
}

export const InkLogViewer: React.FC<InkLogViewerProps> = ({ log, enhancer }) => {
  const lines = log.split('\n');

  return (
    <Box flexDirection="column">
      {lines.map((line, i) => {
        const enhanced = enhancer.enhanceLine(line, i);
        return <Text key={i}>{enhanced}</Text>;
      })}
    </Box>
  );
};

// Optional helper to render from CLI
export function runInkLogViewer(log: string, enhancer: LogEnhancer) {
  render(<InkLogViewer log={log} enhancer={enhancer} />);
}