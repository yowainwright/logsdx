import { Theme } from "@/src/types";

export const DEFAULT_THEME = "oh-my-zsh";

export const THEMES: Record<string, Theme> = {
  [DEFAULT_THEME]: {
    name: "oh-my-zsh",
    description: "Theme inspired by Oh My Zsh terminal colors",
    schema: {
      defaultStyle: { color: "white" },
      matchWords: {
        ERROR: { color: "red", styleCodes: ["bold"] },
        WARN: { color: "yellow", styleCodes: ["bold"] },
        WARNING: { color: "yellow", styleCodes: ["bold"] },
        INFO: { color: "blue", styleCodes: ["bold"] },
        DEBUG: { color: "green" },
        SUCCESS: { color: "green", styleCodes: ["bold"] },
        true: { color: "green" },
        false: { color: "red" },
        null: { color: "magenta", styleCodes: ["italic"] },
        undefined: { color: "magenta", styleCodes: ["italic"] },
      },
      // matchStartsWith,
      // matchEndsWith,
      // matchContains,
      matchPatterns: [
        {
          name: "semantic-version",
          pattern: "\\d+\\.\\d+\\.\\d+",
          options: { color: "yellow", styleCodes: ["bold"] },
        },
        {
          name: "date",
          pattern: "\\d{4}-\\d{2}-\\d{2}",
          options: { color: "cyan" },
        },
        {
          name: "time",
          pattern: "\\d{2}:\\d{2}:\\d{2}",
          options: { color: "cyan" },
        },
        {
          name: "quoted-string",
          pattern: "(['\"])(.*?)\\1",
          options: { color: "green" },
        },
        {
          name: "number",
          pattern: "\\b\\d+\\b",
          options: { color: "yellow" },
        },
        {
          name: "curly-brace",
          pattern: "{",
          options: { color: "yellow" },
        },
        {
          name: "curly-brace",
          pattern: "}",
          options: { color: "yellow" },
        },
        {
          name: "square-bracket-left",
          pattern: "[",
          options: { color: "yellow" },
        },
        {
          name: "square-bracket-right",
          pattern: "]",
          options: { color: "yellow" },
        },
        {
          name: "parenthesis-left",
          pattern: "(",
          options: { color: "yellow" },
        },
        {
          name: "parenthesis-right",
          pattern: ")",
          options: { color: "white" },
        },
        {
          name: "equal-sign",
          pattern: "=",
          options: { color: "white" },
        },
      ],
    },
  },

  dracula: {
    name: "dracula",
    description: "Dark theme based on the popular Dracula color scheme",
    schema: {
      defaultStyle: { color: "lightGray" },
      matchWords: {
        ERROR: { color: "red", styleCodes: ["bold"] },
        WARN: { color: "orange", styleCodes: ["bold"] },
        WARNING: { color: "orange", styleCodes: ["bold"] },
        INFO: { color: "cyan", styleCodes: ["bold"] },
        DEBUG: { color: "purple" },
        SUCCESS: { color: "green", styleCodes: ["bold"] },
        true: { color: "green" },
        false: { color: "pink" },
        null: { color: "purple", styleCodes: ["italic"] },
        undefined: { color: "purple", styleCodes: ["italic"] },
      },
      matchPatterns: [
        {
          name: "semantic-version",
          pattern: "\\d+\\.\\d+\\.\\d+",
          options: { color: "yellow", styleCodes: ["bold"] },
        },
        {
          name: "date",
          pattern: "\\d{4}-\\d{2}-\\d{2}",
          options: { color: "cyan" },
        },
        {
          name: "time",
          pattern: "\\d{2}:\\d{2}:\\d{2}",
          options: { color: "cyan" },
        },
        {
          name: "quoted-string",
          pattern: "(['\"])(.*?)\\1",
          options: { color: "lightGreen" },
        },
        {
          name: "number",
          pattern: "\\b\\d+\\b",
          options: { color: "pink" },
        },
        {
          name: "curly-brace",
          pattern: "{",
          options: { color: "orange" },
        },
        {
          name: "curly-brace",
          pattern: "}",
          options: { color: "orange" },
        },
        {
          name: "square-bracket-left",
          pattern: "[",
          options: { color: "orange" },
        },
        {
          name: "square-bracket-right",
          pattern: "]",
          options: { color: "orange" },
        },
        {
          name: "parenthesis-left",
          pattern: "(",
          options: { color: "orange" },
        },
        {
          name: "parenthesis-right",
          pattern: ")",
          options: { color: "orange" },
        },
        {
          name: "equal-sign",
          pattern: "=",
          options: { color: "lightGray" },
        },
      ],
    },
  },

  "github-light": {
    name: "github-light",
    description: "Light theme inspired by GitHub's default color scheme",
    schema: {
      defaultStyle: { color: "black" },
      matchWords: {
        error: { color: "red", styleCodes: ["bold"] },
        warn: { color: "orange" },
        warning: { color: "orange" },
        info: { color: "blue" },
        debug: { color: "purple" },
        success: { color: "green" },
        true: { color: "green" },
        false: { color: "red" },
        null: { color: "gray", styleCodes: ["italic"] },
        undefined: { color: "gray", styleCodes: ["italic"] },
      },
      matchPatterns: [
        {
          name: "semantic-version",
          pattern: "\\d+\\.\\d+\\.\\d+",
          options: { color: "blue", styleCodes: ["bold"] },
        },
        {
          name: "date",
          pattern: "\\d{4}-\\d{2}-\\d{2}",
          options: { color: "blue" },
        },
        {
          name: "time",
          pattern: "\\d{2}:\\d{2}:\\d{2}",
          options: { color: "blue" },
        },
        {
          name: "quoted-string",
          pattern: "(['\"])(.*?)\\1",
          options: { color: "forestGreen" },
        },
        {
          name: "number",
          pattern: "\\b\\d+\\b",
          options: { color: "blue" },
        },
        {
          name: "curly-brace",
          pattern: "{",
          options: { color: "darkGray" },
        },
        {
          name: "curly-brace",
          pattern: "}",
          options: { color: "darkGray" },
        },
        {
          name: "square-bracket-left",
          pattern: "[",
          options: { color: "darkGray" },
        },
        {
          name: "square-bracket-right",
          pattern: "]",
          options: { color: "darkGray" },
        },
        {
          name: "parenthesis-left",
          pattern: "(",
          options: { color: "darkGray" },
        },
        {
          name: "parenthesis-right",
          pattern: ")",
          options: { color: "darkGray" },
        },
        {
          name: "equal-sign",
          pattern: "=",
          options: { color: "black" },
        },
      ],
    },
  },

  "github-dark": {
    name: "github-dark",
    description: "Dark theme inspired by GitHub's dark mode",
    schema: {
      defaultStyle: { color: "lightGray" },
      matchWords: {
        error: { color: "red", styleCodes: ["bold"] },
        warn: { color: "orange" },
        warning: { color: "orange" },
        info: { color: "lightBlue" },
        debug: { color: "purple" },
        success: { color: "lightGreen" },
        true: { color: "lightGreen" },
        false: { color: "red" },
        null: { color: "gray", styleCodes: ["italic"] },
        undefined: { color: "gray", styleCodes: ["italic"] },
      },
      matchPatterns: [
        {
          name: "semantic-version",
          pattern: "\\d+\\.\\d+\\.\\d+",
          options: { color: "lightBlue", styleCodes: ["bold"] },
        },
        {
          name: "date",
          pattern: "\\d{4}-\\d{2}-\\d{2}",
          options: { color: "lightBlue" },
        },
        {
          name: "time",
          pattern: "\\d{2}:\\d{2}:\\d{2}",
          options: { color: "lightBlue" },
        },
        {
          name: "quoted-string",
          pattern: "(['\"])(.*?)\\1",
          options: { color: "lightGreen" },
        },
        {
          name: "number",
          pattern: "\\b\\d+\\b",
          options: { color: "lightBlue" },
        },
        {
          name: "curly-brace",
          pattern: "{",
          options: { color: "gray" },
        },
        {
          name: "curly-brace",
          pattern: "}",
          options: { color: "gray" },
        },
        {
          name: "square-bracket-left",
          pattern: "[",
          options: { color: "gray" },
        },
        {
          name: "square-bracket-right",
          pattern: "]",
          options: { color: "gray" },
        },
        {
          name: "parenthesis-left",
          pattern: "(",
          options: { color: "gray" },
        },
        {
          name: "parenthesis-right",
          pattern: ")",
          options: { color: "gray" },
        },
        {
          name: "equal-sign",
          pattern: "=",
          options: { color: "lightGray" },
        },
      ],
    },
  },

  "solarized-light": {
    name: "solarized-light",
    description: "Light theme based on the popular Solarized color scheme",
    schema: {
      defaultStyle: { color: "base00" },
      matchWords: {
        error: { color: "red", styleCodes: ["bold"] },
        warn: { color: "orange" },
        warning: { color: "orange" },
        info: { color: "blue" },
        debug: { color: "violet" },
        success: { color: "green" },
        true: { color: "green" },
        false: { color: "red" },
        null: { color: "magenta", styleCodes: ["italic"] },
        undefined: { color: "magenta", styleCodes: ["italic"] },
      },
      matchPatterns: [
        {
          name: "semantic-version",
          pattern: "\\d+\\.\\d+\\.\\d+",
          options: { color: "cyan", styleCodes: ["bold"] },
        },
        {
          name: "date",
          pattern: "\\d{4}-\\d{2}-\\d{2}",
          options: { color: "blue" },
        },
        {
          name: "time",
          pattern: "\\d{2}:\\d{2}:\\d{2}",
          options: { color: "blue" },
        },
        {
          name: "quoted-string",
          pattern: "(['\"])(.*?)\\1",
          options: { color: "green" },
        },
        {
          name: "number",
          pattern: "\\b\\d+\\b",
          options: { color: "cyan" },
        },
        {
          name: "curly-brace",
          pattern: "{",
          options: { color: "yellow" },
        },
        {
          name: "curly-brace",
          pattern: "}",
          options: { color: "yellow" },
        },
        {
          name: "square-bracket-left",
          pattern: "[",
          options: { color: "yellow" },
        },
        {
          name: "square-bracket-right",
          pattern: "]",
          options: { color: "yellow" },
        },
        {
          name: "parenthesis-left",
          pattern: "(",
          options: { color: "yellow" },
        },
        {
          name: "parenthesis-right",
          pattern: ")",
          options: { color: "yellow" },
        },
        {
          name: "equal-sign",
          pattern: "=",
          options: { color: "base00" },
        },
      ],
    },
  },

  "solarized-dark": {
    name: "solarized-dark",
    description: "Dark theme based on the popular Solarized color scheme",
    schema: {
      defaultStyle: { color: "base0" },
      matchWords: {
        error: { color: "red", styleCodes: ["bold"] },
        warn: { color: "orange" },
        warning: { color: "orange" },
        info: { color: "blue" },
        debug: { color: "violet" },
        success: { color: "green" },
        true: { color: "green" },
        false: { color: "red" },
        null: { color: "magenta", styleCodes: ["italic"] },
        undefined: { color: "magenta", styleCodes: ["italic"] },
      },
      matchPatterns: [
        {
          name: "semantic-version",
          pattern: "\\d+\\.\\d+\\.\\d+",
          options: { color: "cyan", styleCodes: ["bold"] },
        },
        {
          name: "date",
          pattern: "\\d{4}-\\d{2}-\\d{2}",
          options: { color: "blue" },
        },
        {
          name: "time",
          pattern: "\\d{2}:\\d{2}:\\d{2}",
          options: { color: "blue" },
        },
        {
          name: "quoted-string",
          pattern: "(['\"])(.*?)\\1",
          options: { color: "green" },
        },
        {
          name: "number",
          pattern: "\\b\\d+\\b",
          options: { color: "cyan" },
        },
        {
          name: "curly-brace",
          pattern: "{",
          options: { color: "yellow" },
        },
        {
          name: "curly-brace",
          pattern: "}",
          options: { color: "yellow" },
        },
        {
          name: "square-bracket-left",
          pattern: "[",
          options: { color: "yellow" },
        },
        {
          name: "square-bracket-right",
          pattern: "]",
          options: { color: "yellow" },
        },
        {
          name: "parenthesis-left",
          pattern: "(",
          options: { color: "yellow" },
        },
        {
          name: "parenthesis-right",
          pattern: ")",
          options: { color: "yellow" },
        },
        {
          name: "equal-sign",
          pattern: "=",
          options: { color: "base0" },
        },
      ],
    },
  },
};
