import { Command } from "commander";
import fs from "fs";
import path from "path";
import { LogsDX, getThemeNames } from "../index";
import type { CliOptions } from "./types";
import type { LogsDXOptions } from "../types";

/**
 * Load configuration from .logsdxrc file
 */
function loadConfig(configPath?: string): LogsDXOptions {
  // Default config
  const defaultConfig: LogsDXOptions = {
    theme: 'oh-my-zsh',
    outputFormat: 'ansi',
    debug: false,
    customRules: {}
  };
  
  try {
    // Look for config in specified path or default locations
    const configLocations = [
      configPath,
      './.logsdxrc',
      './.logsdxrc.json',
      path.join(process.env.HOME || '', '.logsdxrc'),
      path.join(process.env.HOME || '', '.logsdxrc.json')
    ].filter(Boolean);
    
    for (const location of configLocations) {
      if (location && fs.existsSync(location)) {
        const configContent = fs.readFileSync(location, 'utf8');
        const config = JSON.parse(configContent);
        return { ...defaultConfig, ...config };
      }
    }
  } catch (error) {
    console.warn(`Failed to load config: ${error}`);
  }
  
  return defaultConfig;
}

/**
 * Process CLI arguments
 */
function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    theme: undefined,
    debug: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--theme' && i + 1 < args.length) {
      options.theme = args[++i];
    } else if (arg === '--debug') {
      options.debug = true;
    } else if (arg === '--list-themes') {
      options.listThemes = true;
    } else if (arg === '--output' && i + 1 < args.length) {
      options.output = args[++i];
    } else if (arg === '--config' && i + 1 < args.length) {
      options.configPath = args[++i];
    } else if (!arg?.startsWith('--') && !options.input) {
      options.input = arg;
    }
  }

  return options;
}

/**
 * Main CLI function
 */
export async function main(args: string[] = process.argv.slice(2)): Promise<void> {
  const cliOptions = parseArgs(args);
  
  // Load config from file
  const config = loadConfig(cliOptions.configPath);
  
  // Create LogsDX instance with merged options
  const logsDX = LogsDX.getInstance({
    theme: cliOptions.theme || config.theme,
    debug: cliOptions.debug || config.debug,
    customRules: config.customRules,
    outputFormat: cliOptions.output === 'html' ? 'html' : 'ansi'
  });
  
  // List available themes
  if (cliOptions.listThemes) {
    console.log('Available themes:');
    getThemeNames().forEach(theme => console.log(`- ${theme}`));
    return;
  }
  
  // Process input
  const processLine = (line: string): string => {
    return logsDX.processLine(line);
  };
  
  // Process input from file or stdin
  if (cliOptions.input) {
    try {
      const content = fs.readFileSync(cliOptions.input, 'utf8');
      const output = logsDX.processLog(content);
      
      if (cliOptions.output) {
        fs.writeFileSync(cliOptions.output, output);
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error(`Error processing file: ${error}`);
      process.exit(1);
    }
  } else {
    // Process from stdin
    process.stdin.setEncoding('utf8');
    
    let buffer = '';
    
    process.stdin.on('data', (data: string) => {
      buffer += data;
      
      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      lines.forEach(line => {
        if (line.trim()) {
          const output = processLine(line);
          if (output) {
            console.log(output);
          }
        }
      });
    });
    
    process.stdin.on('end', () => {
      if (buffer.trim()) {
        const output = processLine(buffer);
        if (output) {
          console.log(output);
        }
      }
    });
    
    process.stdin.on('error', (error: Error) => {
      console.error('Error reading input:', error);
      process.exit(1);
    });
  }
}

// Create a Command instance for better CLI handling
const program = new Command();

program
  .name('logsdx')
  .description('A powerful log processing and styling tool')
  .version('0.1.0')
  .option('-t, --theme <theme>', 'Theme to use for styling')
  .option('-d, --debug', 'Enable debug mode')
  .option('-o, --output <file>', 'Output file path')
  .option('-c, --config <file>', 'Path to config file')
  .option('--list-themes', 'List available themes')
  .argument('[input]', 'Input file (optional, reads from stdin if not provided)')
  .action((input, options) => {
    const args = [];
    
    if (input) args.push(input);
    if (options.theme) args.push('--theme', options.theme);
    if (options.debug) args.push('--debug');
    if (options.output) args.push('--output', options.output);
    if (options.config) args.push('--config', options.config);
    if (options.listThemes) args.push('--list-themes');
    
    main(args).catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
  });

// Run the CLI if this file is executed directly
if (require.main === module) {
  program.parse();
}

