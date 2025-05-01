#!/usr/bin/env bun

/**
 * Interactive changeset script for pre-commit hook
 * 
 * This script:
 * 1. Detects which packages have changed
 * 2. Prompts the user with radio options for each package (patch/minor/major/bypass)
 * 3. Creates the appropriate changesets based on user selections
 */

import { execSync } from 'child_process';
import { createInterface } from 'readline';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

// Configuration
const PACKAGES_DIR = 'packages';
const PARSERS_DIR = join(PACKAGES_DIR, 'parsers');
const CHANGESET_DIR = '.changeset';

// Ensure changeset directory exists
if (!existsSync(CHANGESET_DIR)) {
  mkdirSync(CHANGESET_DIR, { recursive: true });
}

// Get changed files
const changedFiles = execSync('git diff --cached --name-only').toString().trim().split('\n');

// Map of package paths to package names
const packageMap: Record<string, string> = {
  'src': 'logsdx',
  [join(PARSERS_DIR, 'core')]: '@logsdx/parser-core',
  [join(PARSERS_DIR, 'json')]: '@logsdx/parser-json',
  [join(PARSERS_DIR, 'regex')]: '@logsdx/parser-regex',
  [join(PACKAGES_DIR, 'clients/react')]: '@logsdx/client-react',
  [join(PACKAGES_DIR, 'clients/html')]: '@logsdx/client-html',
  [join(PACKAGES_DIR, 'themes/asci')]: '@logsdx/theme-asci',
};

// Determine affected packages
const affectedPackages: string[] = [];

// Check for changes in each package
Object.entries(packageMap).forEach(([packagePath, packageName]) => {
  if (changedFiles.some(file => file.startsWith(packagePath))) {
    affectedPackages.push(packageName);
  }
});

// If no packages are affected, exit
if (affectedPackages.length === 0) {
  console.log('No packages affected. Skipping changeset creation.');
  process.exit(0);
}

// Check if there are already changesets for these packages
const hasChangesetFiles = changedFiles.some(file => file.startsWith(CHANGESET_DIR));
if (hasChangesetFiles) {
  console.log('Changeset files already exist. Skipping changeset creation.');
  process.exit(0);
}

// Create readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt options
const options = [
  { value: 'patch', label: 'patch - for backwards-compatible bug fixes' },
  { value: 'minor', label: 'minor - for backwards-compatible new features' },
  { value: 'major', label: 'major - for breaking changes' },
  { value: 'bypass', label: 'bypass - skip creating a changeset for this package' }
];

// Store user selections
const selections: Record<string, string> = {};

// Prompt user for each affected package
function promptForPackage(index: number) {
  if (index >= affectedPackages.length) {
    // All packages have been processed
    createChangesets();
    return;
  }

  const packageName = affectedPackages[index];
  console.log(`\nPackage: ${packageName}`);
  console.log('Select a version bump type:');
  
  options.forEach((option, i) => {
    console.log(`${i + 1}) ${option.label}`);
  });

  rl.question('Enter your choice (1-4): ', (answer) => {
    const choice = parseInt(answer.trim());
    if (isNaN(choice) || choice < 1 || choice > 4) {
      console.log('Invalid choice. Please enter a number between 1 and 4.');
      promptForPackage(index); // Ask again
    } else {
      const selectedOption = options[choice - 1];
      if (selectedOption.value !== 'bypass') {
        selections[packageName] = selectedOption.value;
      }
      promptForPackage(index + 1); // Move to next package
    }
  });
}

// Create changesets based on user selections
function createChangesets() {
  // Group selections by bump type
  const bumpGroups: Record<string, string[]> = {
    patch: [],
    minor: [],
    major: []
  };

  Object.entries(selections).forEach(([packageName, bumpType]) => {
    bumpGroups[bumpType].push(packageName);
  });

  // Create a changeset for each bump type
  Object.entries(bumpGroups).forEach(([bumpType, packages]) => {
    if (packages.length === 0) return;

    // Generate a random ID for the changeset
    const changesetId = randomBytes(3).toString('hex');
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `${timestamp}-${changesetId}.md`;
    const filepath = join(CHANGESET_DIR, filename);

    // Create the changeset content
    let content = '---\n';
    packages.forEach(pkg => {
      content += `"${pkg}": ${bumpType}\n`;
    });
    content += '---\n\n';
    content += `Auto-generated ${bumpType} changeset for ${packages.join(', ')}.\n`;

    // Write the changeset file
    writeFileSync(filepath, content);
    console.log(`Created ${bumpType} changeset: ${filepath}`);
  });

  console.log('\nChangesets created successfully!');
  rl.close();
  process.exit(0);
}

// Start the prompting process
console.log('📦 Package changes detected. Creating changesets...');
promptForPackage(0);
