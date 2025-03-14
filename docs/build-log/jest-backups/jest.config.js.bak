/**
 * Jest configuration for server package
 */

module.exports = {
  // Automatically clear mock calls between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // A list of paths to directories that Jest should use to search for files in
  roots: ["<rootDir>/src"],

  // The test environment that will be used for testing
  testEnvironment: "node",

  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.(ts|js)$": ["babel-jest", {
      configFile: "./babel.config.cjs"
    }]
  },

  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],

  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: [
    "/node_modules/"
  ],
  
  // A list of paths to modules that run some code to configure or set up the testing framework
  setupFiles: ["<rootDir>/src/tests/setup.js"],
  
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // Transform configuration for ESM
  transformIgnorePatterns: [
    "/node_modules/(?!.*\\.mjs$)"
  ]
}; 