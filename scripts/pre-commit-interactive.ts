#!/usr/bin/env bun

/**
 * Pre-commit hook that checks for package changes and prompts for changesets
 */

import { execSync } from 'child_process';
import { createInterface } from 'readline';
import { spawnSync } from 'child_process';

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
  console.log('Would you like to create changesets interactively?');
  console.log('1) Yes - create changesets now');
  console.log('2) No - continue without changesets');
  
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Enter your choice (1-2): ', (answer) => {
    const choice = parseInt(answer.trim());
    if (choice === 1) {
      // Run the interactive changeset script
      console.log('Running interactive changeset script...');
      rl.close();
      
      const result = spawnSync('bun', ['scripts/interactive-changeset.ts'], {
        stdio: 'inherit'
      });
      
      if (result.status === 0) {
        console.log('Changesets created successfully!');
        process.exit(0);
      } else {
        console.error('Failed to create changesets.');
        process.exit(1);
      }
    } else {
      console.log('Continuing without changesets.');
      rl.close();
      process.exit(0);
    }
  });
} else {
  // No package changes or changesets already exist
  process.exit(0);
}
