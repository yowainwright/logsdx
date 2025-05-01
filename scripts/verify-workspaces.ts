#!/usr/bin/env bun

/**
 * This script verifies that all workspace dependencies can be resolved.
 * It's a simple way to check if the workspace configuration is correct.
 */

import fs from 'fs';
import path from 'path';

// Configuration
const PACKAGES_DIR = 'packages';
const PARSERS_DIR = path.join(PACKAGES_DIR, 'parsers');

interface PackageJson {
  name: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

// Helper function to read package.json
function readPackageJson(filePath: string): PackageJson | null {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

// Check if a package exists in the workspace
function packageExistsInWorkspace(packageName: string): boolean {
  // Special case for the root package
  if (packageName === 'logsdx') {
    const rootPackageJson = readPackageJson('package.json');
    return rootPackageJson !== null && rootPackageJson.name === 'logsdx';
  }
  
  // For scoped packages, check in the packages directory
  if (packageName.startsWith('@logsdx/')) {
    const packagePath = packageName.replace('@logsdx/', '');
    
    // Check for parser packages
    if (packagePath.startsWith('parser-')) {
      const parserName = packagePath.replace('parser-', '');
      const parserPackageJsonPath = path.join(PARSERS_DIR, parserName, 'package.json');
      
      if (fs.existsSync(parserPackageJsonPath)) {
        const packageJson = readPackageJson(parserPackageJsonPath);
        return packageJson !== null && packageJson.name === packageName;
      }
    }
    
    // Check for other packages
    const packageParts = packagePath.split('-');
    if (packageParts.length > 1) {
      const packageType = packageParts[0] + 's'; // e.g., 'theme' -> 'themes'
      const packageName = packageParts.slice(1).join('-');
      const packageJsonPath = path.join(PACKAGES_DIR, packageType, packageName, 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = readPackageJson(packageJsonPath);
        return packageJson !== null && packageJson.name === packageName;
      }
    }
    
    // Direct check in packages directory
    const directPackageJsonPath = path.join(PACKAGES_DIR, packagePath, 'package.json');
    if (fs.existsSync(directPackageJsonPath)) {
      const packageJson = readPackageJson(directPackageJsonPath);
      return packageJson !== null && packageJson.name === packageName;
    }
  }
  
  return false;
}

// Check workspace dependencies in a package
function checkWorkspaceDependencies(packageJsonPath: string): boolean {
  const packageJson = readPackageJson(packageJsonPath);
  if (!packageJson) return false;
  
  const packageName = packageJson.name;
  console.log(`Checking workspace dependencies for ${packageName}...`);
  
  let hasErrors = false;
  
  // Check dependencies
  if (packageJson.dependencies) {
    Object.entries(packageJson.dependencies).forEach(([dep, version]) => {
      if (version.startsWith('workspace:')) {
        const depName = dep;
        if (!packageExistsInWorkspace(depName)) {
          console.error(`❌ Workspace dependency "${depName}" not found for ${packageName}`);
          hasErrors = true;
        } else {
          console.log(`✅ Workspace dependency "${depName}" found for ${packageName}`);
        }
      }
    });
  }
  
  // Check peerDependencies
  if (packageJson.peerDependencies) {
    Object.entries(packageJson.peerDependencies).forEach(([dep, version]) => {
      if (version.startsWith('workspace:')) {
        const depName = dep;
        if (!packageExistsInWorkspace(depName)) {
          console.error(`❌ Workspace peer dependency "${depName}" not found for ${packageName}`);
          hasErrors = true;
        } else {
          console.log(`✅ Workspace peer dependency "${depName}" found for ${packageName}`);
        }
      }
    });
  }
  
  return !hasErrors;
}

// Main function
function main() {
  console.log('Verifying workspace dependencies...');
  
  // Check root package
  const rootResult = checkWorkspaceDependencies('package.json');
  
  // Check parser packages
  const parserCoreResult = checkWorkspaceDependencies(path.join(PARSERS_DIR, 'core', 'package.json'));
  const parserJsonResult = checkWorkspaceDependencies(path.join(PARSERS_DIR, 'json', 'package.json'));
  const parserRegexResult = checkWorkspaceDependencies(path.join(PARSERS_DIR, 'regex', 'package.json'));
  
  // Check result
  const allPassed = rootResult && parserCoreResult && parserJsonResult && parserRegexResult;
  
  if (allPassed) {
    console.log('\n✅ All workspace dependencies are correctly configured!');
    process.exit(0);
  } else {
    console.error('\n❌ Some workspace dependencies could not be resolved. See errors above.');
    process.exit(1);
  }
}

main();
