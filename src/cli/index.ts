import { Command } from "commander";
import fs from "fs";
import path from "path";
import { LogsDX, getThemeNames } from "@/src/index";
import type { CliOptions } from "@/src/cli/types";
import type { LogsDXOptions } from "@/src/types";
import { version } from "../../package.json";

export function loadConfig(configPath?: string): LogsDXOptions {
  const defaultConfig: LogsDXOptions = {
    theme: 'oh-my-zsh',
    outputFormat: 'ansi',
    debug: false,
    customRules: {}
  };
  
  try {
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


export function parseArgs(args: string[]): CliOptions {
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
    } else if (arg === '--quiet') {
      options.quiet = true;
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

export async function main(args: string[] = process.argv.slice(2)): Promise<void> {
  const cliOptions = parseArgs(args);
  const config = loadConfig(cliOptions.configPath);
  const logsDX = LogsDX.getInstance({
    theme: cliOptions.theme || config.theme,
    debug: cliOptions.debug || config.debug,
    customRules: config.customRules,
    outputFormat: cliOptions.output === 'html' ? 'html' : 'ansi'
  });
  
  if (cliOptions.listThemes) {
    if (!cliOptions.quiet) {
      console.log('Available themes:');
      getThemeNames().forEach(theme => console.log(`- ${theme}`));
    }
    return;
  }
  
  const processLine = (line: string): string => {
    return logsDX.processLine(line);
  };
  
  if (cliOptions.input) {
    try {
      const content = fs.readFileSync(cliOptions.input, 'utf8');
      const output = logsDX.processLog(content);
      
      if (cliOptions.output) {
        fs.writeFileSync(cliOptions.output, output);
      } else if (!cliOptions.quiet) {
        console.log(output);
      }
    } catch (error) {
      console.error(`Error processing file: ${error}`);
      process.exit(1);
    }
  } else {
    process.stdin.setEncoding('utf8');
    
    let buffer = '';
    
    process.stdin.on('data', (data: string) => {
      buffer += data;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      lines.forEach(line => {
        if (line.trim()) {
          const output = processLine(line);
          if (output && !cliOptions.quiet) {
            console.log(output);
          }
        }
      });
    });
    
    process.stdin.on('end', () => {
      if (buffer.trim()) {
        const output = processLine(buffer);
        if (output && !cliOptions.quiet) {
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

const program = new Command();

program
  .name('logsdx')
  .description('A powerful log processing and styling tool')
  .version(version)
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

if (require.main === module) {
  program.parse();
}

