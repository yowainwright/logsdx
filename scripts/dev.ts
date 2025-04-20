import { watch } from "fs/promises";
import { spawn } from "child_process";
import { join } from "path";

async function watchPackages() {
  const packages = [
    "core/main",
    "plugins/prism",
    "plugins/shiki",
    "themes/synthwave",
    "clients/html",
  ];

  for (const pkg of packages) {
    const srcDir = join("packages", pkg, "src");

    console.log(`Watching ${srcDir}...`);

    const watcher = watch(srcDir, { recursive: true });

    for await (const event of watcher) {
      if (event.filename?.endsWith(".ts") || event.filename?.endsWith(".tsx")) {
        console.log(`Changes detected in ${pkg}, rebuilding...`);
        spawn("bun", ["run", `build:${pkg.replace("/", "-")}`], {
          stdio: "inherit",
        });
      }
    }
  }
}

watchPackages().catch(console.error);
