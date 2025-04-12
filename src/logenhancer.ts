import {
  type LogPlugin,
  type LogParser,
  type LogClient,
  type LogEnhancerOptions,
} from "@/src/types";

export class LogEnhancer {
  private plugins: LogPlugin[] = [];
  private parsers: LogParser[] = [];
  private clients: LogClient[] = [];
  private debug: boolean;

  constructor(options: LogEnhancerOptions = {}) {
    this.debug = options.debug ?? false;

    if (options.plugins) {
      this.loadPlugins(options.plugins);
    }
    if (options.parsers) {
      this.loadParsers(options.parsers);
    }
    if (options.clients) {
      this.loadClients(options.clients);
    }
  }

  private async loadPlugins(plugins: (string | LogPlugin)[]) {
    for (const plugin of plugins) {
      if (typeof plugin === "string") {
        try {
          const mod = await import(plugin);
          this.use(mod.default);
        } catch (err) {
          if (this.debug) {
            console.error(`Failed to load plugin: ${plugin}`, err);
          }
        }
      } else {
        this.use(plugin);
      }
    }
  }

  private async loadParsers(parsers: (string | LogParser)[]) {
    for (const parser of parsers) {
      if (typeof parser === "string") {
        try {
          const mod = await import(parser);
          this.addParser(mod.default);
        } catch (err) {
          if (this.debug) {
            console.error(`Failed to load parser: ${parser}`, err);
          }
        }
      } else {
        this.addParser(parser);
      }
    }
  }

  private async loadClients(clients: (string | LogClient)[]) {
    for (const client of clients) {
      if (typeof client === "string") {
        try {
          const mod = await import(client);
          this.addClient(mod.default);
        } catch (err) {
          if (this.debug) {
            console.error(`Failed to load client: ${client}`, err);
          }
        }
      } else {
        this.addClient(client);
      }
    }
  }

  use(plugin: LogPlugin) {
    if (this.debug) {
      console.log(`Adding plugin: ${plugin.name}`);
    }
    this.plugins.push(plugin);
  }

  addParser(parser: LogParser) {
    if (this.debug) {
      console.log(`Adding parser: ${parser.name}`);
    }
    this.parsers.push(parser);
  }

  addClient(client: LogClient) {
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
