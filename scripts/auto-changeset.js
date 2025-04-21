#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Get bump type from command line argument
const bumpType = process.argv[2] || 'patch';

// Validate bump type
if (!['patch', 'minor', 'major'].includes(bumpType)) {
  console.error(`Invalid bump type: ${bumpType}. Must be one of: patch, minor, major`);
  process.exit(1);
}

// Configuration
const CHANGESET_DIR = '.changeset';
const PACKAGES_DIR = 'packages';
const PARSERS_DIR = path.join(PACKAGES_DIR, 'parsers');

// Ensure changeset directory exists
if (!fs.existsSync(CHANGESET_DIR)) {
  fs.mkdirSync(CHANGESET_DIR, { recursive: true });
}

// Get changed files since last commit
function getChangedFiles() {
  try {
    // Get all changed files (including staged and unstaged)
    const stagedFiles = execSync('git diff --name-only --cached').toString().trim().split('\n').filter(Boolean);
    const unstagedFiles = execSync('git diff --name-only').toString().trim().split('\n').filter(Boolean);

    // Combine and deduplicate
    return [...new Set([...stagedFiles, ...unstagedFiles])];
  } catch (error) {
    console.error('Error getting changed files:', error.message);
    return [];
  }
}

// Determine affected packages based on changed files
function getAffectedPackages(changedFiles) {
  const affectedPackages = new Set();

  // Check for changes in the core package
  if (changedFiles.some(file => file.startsWith('src/'))) {
    affectedPackages.add('logsdx');
  }

  // Check for changes in parser packages
  changedFiles.forEach(file => {
    // Parser core
    if (file.startsWith(path.join(PARSERS_DIR, 'core'))) {
      affectedPackages.add('@logsdx/parser-core');
      // When core changes, all dependent parsers are affected
      affectedPackages.add('@logsdx/parser-json');
      affectedPackages.add('@logsdx/parser-regex');
    }

    // Parser JSON
    if (file.startsWith(path.join(PARSERS_DIR, 'json'))) {
      affectedPackages.add('@logsdx/parser-json');
    }

    // Parser Regex
    if (file.startsWith(path.join(PARSERS_DIR, 'regex'))) {
      affectedPackages.add('@logsdx/parser-regex');
    }

    // Add more package checks as needed
  });

  return Array.from(affectedPackages);
}

// Generate a changeset file
function generateChangeset(affectedPackages) {
  if (affectedPackages.length === 0) {
    console.log('No packages affected. Skipping changeset creation.');
    return;
  }

  // Generate a random ID for the changeset
  const changesetId = crypto.randomBytes(3).toString('hex');
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = `${timestamp}-${changesetId}.md`;
  const filepath = path.join(CHANGESET_DIR, filename);

  // Create the changeset content
  let content = '---\n';
  affectedPackages.forEach(pkg => {
    content += `"${pkg}": ${bumpType}\n`;
  });
  content += '---\n\n';
  content += `Auto-generated ${bumpType} changeset for ${affectedPackages.join(', ')}.\n`;

  // Write the changeset file
  fs.writeFileSync(filepath, content);
  console.log(`Created changeset: ${filepath}`);

  return filepath;
}

// Main function
function main() {
  console.log(`Creating ${bumpType} changeset...`);

  const changedFiles = getChangedFiles();

  if (changedFiles.length === 0) {
    console.log('No changed files detected.');
    return;
  }

  console.log('Changed files:');
  changedFiles.forEach(file => console.log(`  - ${file}`));

  const affectedPackages = getAffectedPackages(changedFiles);

  console.log('\nAffected packages:');
  if (affectedPackages.length === 0) {
    console.log('  None');
  } else {
    affectedPackages.forEach(pkg => console.log(`  - ${pkg}`));
  }

  const changesetPath = generateChangeset(affectedPackages);

  if (changesetPath) {
    console.log('\nChangeset created successfully!');
    console.log(`You can edit the description in ${changesetPath} if needed.`);
  }
}

main();
