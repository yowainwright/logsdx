import { ThemePreset } from '../types';

export const DEFAULT_THEME = 'oh-my-zsh';

export const THEMES: Record<string, ThemePreset> = {
  [DEFAULT_THEME]: {
    name: 'oh-my-zsh',
    description: 'Theme inspired by oh-my-zsh default colors',
    schema: {
      defaultStyle: { color: 'white' },
      matchWords: {
        'error': { color: 'red', styleCodes: ['bold'] },
        'warn': { color: 'yellow' },
        'warning': { color: 'yellow' },
        'info': { color: 'cyan' },
        'debug': { color: 'blue' },
        'success': { color: 'green' },
        'true': { color: 'green' },
        'false': { color: 'red' },
        'null': { color: 'magenta', styleCodes: ['italic'] },
        'undefined': { color: 'magenta', styleCodes: ['italic'] }
      },
      // matchStartsWith,
      // matchEndsWith,
      // matchContains,
      matchPatterns: [
        {
          name: 'semantic-version',
          pattern: '\\d+\\.\\d+\\.\\d+',  // Semantic versions
          options: { color: 'yellow', styleCodes: ['bold'] }
        },
        {
          name: 'date',
          pattern: '\\d{4}-\\d{2}-\\d{2}', // Dates
          options: { color: 'cyan' }
        },
        {
          name: 'time',
          pattern: '\\d{2}:\\d{2}:\\d{2}', // Times
          options: { color: 'cyan' }
        },
        {
          name: 'quoted-string',
          pattern: '([\'"])(.*?)\\1', // Quoted strings
          options: { color: 'green' }
        },
        {
          name: 'number',
          pattern: '\\b\\d+\\b', // Numbers
          options: { color: 'yellow' }
        },
      {
        name: 'curly-brace',
        pattern: '{',
        options: { color: 'yellow' },
      },
      {
        name: 'curly-brace',
        pattern: '}',
        options: { color: 'yellow' },
      },
      {
        name: 'square-bracket-left',
        pattern: '[',
        options: { color: 'yellow' },
      },
      {
        name: 'square-bracket-right',
        pattern: ']',
        options: { color: 'yellow' },
      },
      {
        name: 'parenthesis-left',
        pattern: '(',
        options: { color: 'yellow' },
      },
      {
        name: 'parenthesis-right',
        pattern: ')',
        options: { color: 'white' },
      },
      {
        name: 'equal-sign',
        pattern: '=',
        options: { color: 'white' },
      },
      ],
    }
  }
};
