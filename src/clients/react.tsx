'use client';

import React from 'react';
import { LogEnhancer } from './logenhancer';

interface LogViewerProps {
  log: string;
  enhancer: LogEnhancer;
}

const LogViewer: React.FC<LogViewerProps> = ({ log, enhancer }) => {
  const lines = log.split('\n');

  return (
    <div className="font-mono text-sm p-2 overflow-auto whitespace-pre-wrap h-full w-full">
      {lines.map((line, i) => {
        const enhanced = enhancer.enhanceLine(line, i);
        return <div key={i}>{enhanced}</div>;
      })}
    </div>
  );
};