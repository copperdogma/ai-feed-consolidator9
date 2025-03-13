/**
 * Jest configuration for client package
 */

module.exports = {
  // The root directory that Jest should scan for tests and modules
  rootDir: ".",

  // The test environment that will be used for testing
  testEnvironment: "jsdom",

  // Automatically clear mock calls between every test
  clearMocks: true,

  // A list of paths to directories that Jest should use to search for files in
  roots: ["<rootDir>/src"],

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: [
    "/node_modules/"
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": ["babel-jest", { 
      configFile: "./babel.config.cjs"
    }]
  },

  // An array of file extensions your modules use
  moduleFileExtensions: [
    "js",
    "jsx",
    "ts",
    "tsx",
    "json",
    "node"
  ],

  // A map from regular expressions to module names that allow to stub out resources
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^views/(.*)$": "<rootDir>/src/views/$1",
    "^components/(.*)$": "<rootDir>/src/components/$1",
    "^hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^lib/(.*)$": "<rootDir>/src/lib/$1"
  },

  // A list of paths to modules that run some code to configure or set up the testing framework
  setupFilesAfterEnv: [
    "<rootDir>/src/tests/setup.js"
  ],

  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // Transform more modules than the defaults
  transformIgnorePatterns: [
    "/node_modules/(?!.*\\.mjs$)"
  ],

  // Better error messages
  testRunner: "jest-circus/runner",
  
  // Make manual mocks work with ESM
  moduleDirectories: ["node_modules", "<rootDir>/src"]
}; 