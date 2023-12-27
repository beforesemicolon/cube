module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testEnvironment: 'jsdom',
  testRegex: './src/.*\\.(test|spec)?\\.(js|ts)$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  roots: ['<rootDir>/src'],
  globalSetup: '<rootDir>/scripts/global-test-setup.cjs',
  globalTeardown: '<rootDir>/scripts/global-test-teardown.cjs',
  setupFilesAfterEnv: ["<rootDir>/scripts/set-tests-up.cjs"]
};
