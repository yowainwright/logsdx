#!/usr/bin/env bun

import { existsSync, writeFileSync, chmodSync, mkdirSync } from "fs";
import { join } from "path";

const HOOKS_DIR = ".git/hooks";

const PRE_COMMIT = `#!/bin/sh
cd "$(git rev-parse --show-toplevel)" || exit 1
bun run format && bun run lint && bun test
`;

const POST_CHECKOUT = `#!/bin/sh
changed=$(git diff-tree -r --name-only --no-commit-id $1 $2 2>/dev/null)
if echo "$changed" | grep -q "package.json\\|bun.lock"; then
  echo "Dependencies changed, running bun install..."
  bun install
fi
`;

const POST_MERGE = `#!/bin/sh
changed=$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD 2>/dev/null)
if echo "$changed" | grep -q "package.json\\|bun.lock"; then
  echo "Dependencies changed, running bun install..."
  bun install
fi
`;

const HOOKS = {
  "pre-commit": PRE_COMMIT,
  "post-checkout": POST_CHECKOUT,
  "post-merge": POST_MERGE,
};

const installHooks = (): void => {
  const isGitRepo = existsSync(".git");
  if (!isGitRepo) {
    console.log("Not a git repository, skipping hook installation");
    return;
  }

  const hooksDir = HOOKS_DIR;
  if (!existsSync(hooksDir)) {
    mkdirSync(hooksDir, { recursive: true });
  }

  let installed = 0;
  let skipped = 0;

  const hookNames = Object.keys(HOOKS) as Array<keyof typeof HOOKS>;
  for (const hookName of hookNames) {
    const hookPath = join(hooksDir, hookName);
    const hookExists = existsSync(hookPath);

    if (hookExists) {
      skipped = skipped + 1;
      continue;
    }

    const hookContent = HOOKS[hookName];
    writeFileSync(hookPath, hookContent, { mode: 0o755 });
    chmodSync(hookPath, 0o755);
    installed = installed + 1;
    console.log(`Installed ${hookName} hook`);
  }

  const hasInstalledHooks = installed > 0;
  if (hasInstalledHooks) {
    console.log(`\nInstalled ${installed} git hook(s)`);
  }

  const hasSkippedHooks = skipped > 0;
  if (hasSkippedHooks) {
    console.log(`Skipped ${skipped} existing hook(s)`);
  }

  const hasNoChanges = installed === 0 && skipped === 0;
  if (hasNoChanges) {
    console.log("No hooks to install");
  }
};

installHooks();
