import { type LineParseResult, type LineParser } from '../types';

export const defaultLineParser: LineParser = (line) => {
  const result: LineParseResult = {};

  if (line.startsWith('[json]')) result.lang = 'json';
  if (line.startsWith('[sql]')) result.lang = 'sql';
  if (line.includes('ERROR')) result.level = 'error';
  if (line.includes('WARN')) result.level = 'warn';
  if (line.includes('INFO')) result.level = 'info';

  return result;
};