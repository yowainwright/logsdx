import type {
  LogPlugin,
  LogParser,
  LogClient,
  LogEnhancerOptions,
} from "@/src/types";

export class LogEnhancer {
  private plugins: LogPlugin[] = [];
  private parsers: LogParser[] = [];
  private clients: LogClient[] = [];
  private debug: boolean;

  constructor(options: LogEnhancerOptions = {}) {
    this.debug = options.debug ?? false;
    if (options.plugins) {
      this.plugins = options.plugins.map((p) =>
        typeof p === "string" ? { name: p, enhance: (line) => line } : p,
      );
    }
    if (options.parsers) {
      this.parsers = options.parsers.map((p) =>
        typeof p === "string" ? { name: p, parse: () => ({}) } : p,
      );
    }
    if (options.clients) {
      this.clients = options.clients.map((c) =>
        typeof c === "string" ? { name: c, write: () => {} } : c,
      );
    }
  }

  use(plugin: LogPlugin): void {
    if (this.debug) {
      console.log(`Adding plugin: ${plugin.name}`);
    }
    this.plugins.push(plugin);
  }

  addParser(parser: LogParser): void {
    if (this.debug) {
      console.log(`Adding parser: ${parser.name}`);
    }
    this.parsers.push(parser);
  }

  addClient(client: LogClient): void {
    if (this.debug) {
      console.log(`Adding client: ${client.name}`);
    }
    this.clients.push(client);
  }

  process(line: string): string {
    // First parse the line
    const context = this.parsers.reduce((acc, parser) => {
      try {
        return { ...acc, ...parser.parse(line) };
      } catch (err) {
        if (this.debug) {
          console.error(`Parser error in ${parser.name}:`, err);
        }
        return acc;
      }
    }, {});

    // Then enhance it
    let result = line;
    for (const plugin of this.plugins) {
      try {
        result = plugin.enhance(result);
      } catch (err) {
        if (this.debug) {
          console.error(`Plugin error in ${plugin.name}:`, err);
        }
      }
    }

    // Finally send to clients
    for (const client of this.clients) {
      try {
        client.write(result);
      } catch (err) {
        if (this.debug) {
          console.error(`Client error in ${client.name}:`, err);
        }
      }
    }

    return result;
  }

  reset() {
    this.plugins = [];
    this.parsers = [];
    this.clients = [];
  }
}
