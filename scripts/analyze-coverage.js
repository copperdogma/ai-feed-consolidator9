#!/usr/bin/env node

/**
 * Test Coverage Analysis Script
 * 
 * This script analyzes test coverage reports and identifies areas that need improvement.
 * It's designed to work with Vitest coverage reports in JSON format.
 * 
 * Usage:
 *   node scripts/analyze-coverage.js [threshold]
 * 
 * Example:
 *   node scripts/analyze-coverage.js 75
 *   (identifies files with less than 75% coverage)
 */

import fs from 'fs';
import path from 'path';

// Default threshold if not provided
const DEFAULT_THRESHOLD = 75;
// Parse command line arguments
const threshold = process.argv[2] ? parseInt(process.argv[2], 10) : DEFAULT_THRESHOLD;

// Coverage report paths
const SERVER_COVERAGE = path.resolve('./packages/server/coverage/coverage-final.json');
const CLIENT_COVERAGE = path.resolve('./packages/client/coverage/coverage-final.json');

// Color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Files and patterns to exclude from warnings and analysis
const EXCLUDED_PATTERNS = [
  // Config files
  /\.eslintrc\.cjs$/,
  /\.babelrc$/,
  /tsconfig\.json$/,
  /vite\.config\.ts$/,
  /vitest\.config\.ts$/,
  /babel\.config\./,
  /jest\.config\./,
  /\.prettierrc$/,
  /\.env$/,
  
  // Build artifacts
  /dist\//,
  /build\//,
  /node_modules\//,
  /\.turbo\//,
  
  // Generated code
  /src\/generated\//,
  /prisma\/generated\//,
  
  // Test files (these are meant to test other code, not be tested themselves)
  /\.test\.tsx?$/,
  /\.vitest\.tsx?$/,
  /vitest\.setup\.(j|t)s$/,
  /src\/tests\/mocks\//,
  /src\/.*\/__mocks__\//,
  /test-.*\.js$/,
  
  // Entry points (can be excluded if they just bootstrap the app)
  /src\/main\.tsx?$/,
  /src\/index\.tsx?$/,
  
  // Type definitions
  /\.d\.ts$/,
  
  // Documentation and examples
  /README\.md$/,
  /\.md$/,
  /docs\//
];

/**
 * Checks if a file path should be excluded from warning and detailed analysis
 */
function shouldExcludeFile(filePath) {
  // Normalize path to handle different formats
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Extract the relative path from the full path
  // This helps with matching patterns regardless of the full system path
  let relativePath = normalizedPath;
  
  // Remove the project root path if present
  if (normalizedPath.includes('/packages/')) {
    relativePath = normalizedPath.substring(normalizedPath.indexOf('/packages/'));
  }
  
  // Check against excluded patterns
  return EXCLUDED_PATTERNS.some(pattern => pattern.test(relativePath));
}

/**
 * Reads a coverage report file and returns the parsed JSON
 */
function readCoverageReport(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`${COLORS.red}Error reading coverage report: ${filePath}${COLORS.reset}`);
    console.error(error.message);
    return null;
  }
}

/**
 * Analyzes a coverage report and identifies files below the threshold
 */
function analyzeCoverage(coverageData, packageName) {
  if (!coverageData) {
    console.log(`${COLORS.yellow}No coverage data available for ${packageName}${COLORS.reset}`);
    return { 
      lowCoverageFiles: [], 
      overallStats: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
        overall: 0
      } 
    };
  }

  try {
    console.log(`\n${COLORS.cyan}=== ${packageName.toUpperCase()} COVERAGE ANALYSIS ===${COLORS.reset}\n`);
    
    // Count files with invalid data to understand the scale of the issue
    let invalidFileCount = 0;
    let validFileCount = 0;
    let totalFileCount = Object.keys(coverageData).length;
    
    const lowCoverageFiles = [];
    let totalStatements = 0;
    let coveredStatements = 0;
    let totalBranches = 0;
    let coveredBranches = 0;
    let totalFunctions = 0;
    let coveredFunctions = 0;
    let totalLines = 0;
    let coveredLines = 0;

    // Analyze each file in the coverage report
    Object.entries(coverageData).forEach(([filePath, fileData], index) => {
      // Check if the coverage data has the required properties
      // Note: Lines data is calculated from statements if 'l' property doesn't exist
      if (!fileData || !fileData.s || !fileData.b || !fileData.f) {
        invalidFileCount++;
        return; // Skip this file
      }
      
      validFileCount++;

      const fileStatements = Object.keys(fileData.s).length;
      const fileCoveredStatements = Object.values(fileData.s).filter(v => v > 0).length;
      
      // Handle branch coverage - flattening array if necessary
      let fileBranches = 0;
      let fileCoveredBranches = 0;
      
      if (Array.isArray(fileData.b)) {
        // If b is an array of arrays
        fileBranches = fileData.b.flat().length;
        fileCoveredBranches = fileData.b.flat().filter(v => v > 0).length;
      } else {
        // If b is an object with indices
        fileBranches = Object.values(fileData.b).flat().length;
        fileCoveredBranches = Object.values(fileData.b).flat().filter(v => v > 0).length;
      }
      
      const fileFunctions = Object.keys(fileData.f).length;
      const fileCoveredFunctions = Object.values(fileData.f).filter(v => v > 0).length;
      
      // Use statement coverage as line coverage if 'l' property doesn't exist
      const fileLines = fileData.l ? Object.keys(fileData.l).length : fileStatements;
      const fileCoveredLines = fileData.l ? Object.values(fileData.l).filter(v => v > 0).length : fileCoveredStatements;

      // Calculate coverage percentages
      const statementCoverage = fileStatements === 0 ? 100 : (fileCoveredStatements / fileStatements) * 100;
      const branchCoverage = fileBranches === 0 ? 100 : (fileCoveredBranches / fileBranches) * 100;
      const functionCoverage = fileFunctions === 0 ? 100 : (fileCoveredFunctions / fileFunctions) * 100;
      const lineCoverage = fileLines === 0 ? 100 : (fileCoveredLines / fileLines) * 100;
      const overallCoverage = (statementCoverage + branchCoverage + functionCoverage + lineCoverage) / 4;

      // Update totals
      totalStatements += fileStatements;
      coveredStatements += fileCoveredStatements;
      totalBranches += fileBranches;
      coveredBranches += fileCoveredBranches;
      totalFunctions += fileFunctions;
      coveredFunctions += fileCoveredFunctions;
      totalLines += fileLines;
      coveredLines += fileCoveredLines;

      // Skip excluded files for detailed analysis
      if (shouldExcludeFile(filePath)) {
        return;
      }

      // If coverage is below threshold, add to low coverage files
      if (overallCoverage < threshold) {
        const relativeFilePath = filePath.replace(/^(\.\/)?packages\/(server|client)\//, '');
        
        // Create a "criticality" score based on coverage and file importance
        // Lower score = more critical to test
        const isCorePath = 
          relativeFilePath.includes('/services/') || 
          relativeFilePath.includes('/lib/') || 
          relativeFilePath.includes('/repositories/') ||
          relativeFilePath.includes('/router/');
        
        const fileComplexity = fileFunctions + (fileBranches / 2);
        const criticalityScore = overallCoverage * (isCorePath ? 0.5 : 1) / (Math.log(fileComplexity + 2) / Math.log(10));
        
        lowCoverageFiles.push({
          filePath: relativeFilePath,
          coverage: {
            statements: statementCoverage.toFixed(2),
            branches: branchCoverage.toFixed(2),
            functions: functionCoverage.toFixed(2),
            lines: lineCoverage.toFixed(2),
            overall: overallCoverage.toFixed(2),
          },
          fileComplexity,
          isCorePath,
          criticalityScore,
          uncoveredFunctions: Object.entries(fileData.f)
            .filter(([_, count]) => count === 0)
            .map(([fnName]) => fnName),
        });
      }
    });
    
    // Calculate overall coverage percentages
    const overallStatementCoverage = totalStatements === 0 ? 100 : (coveredStatements / totalStatements) * 100;
    const overallBranchCoverage = totalBranches === 0 ? 100 : (coveredBranches / totalBranches) * 100;
    const overallFunctionCoverage = totalFunctions === 0 ? 100 : (coveredFunctions / totalFunctions) * 100;
    const overallLineCoverage = totalLines === 0 ? 100 : (coveredLines / totalLines) * 100;
    const overallCoverage = (overallStatementCoverage + overallBranchCoverage + overallFunctionCoverage + overallLineCoverage) / 4;

    // Log overall stats
    console.log(`${COLORS.green}Overall Coverage: ${overallCoverage.toFixed(2)}%${COLORS.reset}`);
    console.log(`${COLORS.blue}Statements: ${overallStatementCoverage.toFixed(2)}%${COLORS.reset}`);
    console.log(`${COLORS.blue}Branches: ${overallBranchCoverage.toFixed(2)}%${COLORS.reset}`);
    console.log(`${COLORS.blue}Functions: ${overallFunctionCoverage.toFixed(2)}%${COLORS.reset}`);
    console.log(`${COLORS.blue}Lines: ${overallLineCoverage.toFixed(2)}%${COLORS.reset}`);
    console.log(`\n${COLORS.yellow}Found ${lowCoverageFiles.length} files below the ${threshold}% threshold${COLORS.reset}`);

    // Sort files by criticality score (ascending)
    lowCoverageFiles.sort((a, b) => a.criticalityScore - b.criticalityScore);

    return {
      lowCoverageFiles,
      overallStats: {
        statements: overallStatementCoverage,
        branches: overallBranchCoverage,
        functions: overallFunctionCoverage,
        lines: overallLineCoverage,
        overall: overallCoverage,
      },
    };
  } catch (error) {
    console.error(`${COLORS.red}Error analyzing coverage:${COLORS.reset}`, error);
    return { 
      lowCoverageFiles: [], 
      overallStats: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
        overall: 0
      } 
    };
  }
}

/**
 * Prints recommendations for improving test coverage
 */
function printRecommendations(serverAnalysis, clientAnalysis) {
  const allLowCoverageFiles = [
    ...(serverAnalysis.lowCoverageFiles || []).map(file => ({ ...file, package: 'server' })),
    ...(clientAnalysis.lowCoverageFiles || []).map(file => ({ ...file, package: 'client' })),
  ];

  // Sort by criticality score (ascending)
  allLowCoverageFiles.sort((a, b) => a.criticalityScore - b.criticalityScore);

  if (allLowCoverageFiles.length === 0) {
    console.log(`\n${COLORS.green}Great job! All files meet or exceed the ${threshold}% coverage threshold.${COLORS.reset}`);
    return true;
  }

  console.log(`\n${COLORS.magenta}=== RECOMMENDED FILES TO TEST ====${COLORS.reset}\n`);
  
  // Take the top 10 most critical files or all if less than 10
  const topFilesToTest = allLowCoverageFiles.slice(0, 10);
  
  topFilesToTest.forEach((file, index) => {
    // Clean up the file path to show a more readable format
    let displayPath = file.filePath;
    
    // Remove absolute path prefixes
    if (displayPath.includes('/Users/')) {
      displayPath = displayPath.substring(displayPath.indexOf('/src/'));
    }
    
    // Ensure the path is relative to the package
    if (!displayPath.startsWith('src/') && !displayPath.startsWith('/src/')) {
      displayPath = 'src/' + displayPath;
    }
    
    // Remove any leading slashes
    displayPath = displayPath.replace(/^\/+/, '');
    
    console.log(`${COLORS.yellow}${index + 1}. ${file.package}/${displayPath}${COLORS.reset}`);
    console.log(`   Coverage: ${file.coverage.overall}%, Functions: ${file.coverage.functions}%, Branches: ${file.coverage.branches}%`);
    
    if (file.uncoveredFunctions.length > 0) {
      console.log(`   ${COLORS.red}Uncovered Functions: ${file.uncoveredFunctions.slice(0, 3).join(', ')}${file.uncoveredFunctions.length > 3 ? '...' : ''}${COLORS.reset}`);
    }
    
    console.log('');
  });
  
  console.log(`\n${COLORS.cyan}Run tests with coverage to see detailed reports:${COLORS.reset}`);
  console.log('npm test');
  console.log('\nView HTML reports in:');
  console.log('- packages/server/coverage/index.html');
  console.log('- packages/client/coverage/index.html');
  
  return false;
}

/**
 * Main function to analyze coverage
 */
async function main() {
  console.log(`${COLORS.cyan}Analyzing test coverage with a threshold of ${threshold}%...${COLORS.reset}`);
  
  const serverCoverage = readCoverageReport(SERVER_COVERAGE);
  const clientCoverage = readCoverageReport(CLIENT_COVERAGE);
  
  const serverAnalysis = analyzeCoverage(serverCoverage, 'server');
  const clientAnalysis = analyzeCoverage(clientCoverage, 'client');
  
  // Check if any overall thresholds are below configured values in vitest configs
  const serverConfig = {
    statements: 75,
    branches: 65,
    functions: 75,
    lines: 75
  };
  
  const clientConfig = {
    statements: 70,
    branches: 60,
    functions: 70,
    lines: 70
  };
  
  let coveragePassesThresholds = true;
  
  if (serverAnalysis.overallStats) {
    const serverPasses = 
      serverAnalysis.overallStats.statements >= serverConfig.statements &&
      serverAnalysis.overallStats.branches >= serverConfig.branches &&
      serverAnalysis.overallStats.functions >= serverConfig.functions &&
      serverAnalysis.overallStats.lines >= serverConfig.lines;
      
    if (!serverPasses) {
      console.log(`\n${COLORS.red}❌ Server coverage does not meet thresholds${COLORS.reset}`);
      coveragePassesThresholds = false;
    }
  }
  
  if (clientAnalysis.overallStats) {
    const clientPasses = 
      clientAnalysis.overallStats.statements >= clientConfig.statements &&
      clientAnalysis.overallStats.branches >= clientConfig.branches &&
      clientAnalysis.overallStats.functions >= clientConfig.functions &&
      clientAnalysis.overallStats.lines >= clientConfig.lines;
      
    if (!clientPasses) {
      console.log(`\n${COLORS.red}❌ Client coverage does not meet thresholds${COLORS.reset}`);
      coveragePassesThresholds = false;
    }
  }
  
  const recommendationsResult = printRecommendations(serverAnalysis, clientAnalysis);
  
  // If there are files below threshold or overall coverage doesn't meet requirements, exit with error
  const shouldFail = process.env.ENFORCE_COVERAGE === 'true' && (!recommendationsResult || !coveragePassesThresholds);
  
  if (shouldFail) {
    console.log(`\n${COLORS.red}❌ Coverage check failed. Address the issues above to meet coverage requirements.${COLORS.reset}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`${COLORS.red}Error analyzing coverage:${COLORS.reset}`, error);
  process.exit(1);
}); 