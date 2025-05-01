#!/usr/bin/env bun

/**
 * Pre-commit hook to check for package changes and suggest creating a changeset
 */

import { execSync } from 'child_process';

// Check for package changes
const changedFiles = execSync('git diff --cached --name-only').toString().trim().split('\n');
const hasPackageChanges = changedFiles.some(file =>
  file.startsWith('src/') ||
  file.startsWith('packages/') ||
  file.startsWith('clients/') ||
  file.startsWith('plugins/')
);

const hasChangesetFiles = changedFiles.some(file => file.startsWith('.changeset/'));

if (hasPackageChanges && !hasChangesetFiles) {
  console.log('📦 Package changes detected but no changeset found.');
  console.log('Consider running one of these commands before committing:');
  console.log('  bun run changeset:patch  - for backwards-compatible bug fixes');
  console.log('  bun run changeset:minor  - for backwards-compatible new features');
  console.log('  bun run changeset:major  - for breaking changes');
  console.log('');
  console.log('You can continue with your commit, but version changes won\'t be tracked.');

}

// Always exit with success code to allow the commit to proceed
process.exit(0);
