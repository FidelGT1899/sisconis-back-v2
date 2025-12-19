/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: ['text', 'lcov', 'html'],
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',

    "^@shared-kernel/(.*)$": "<rootDir>/src/shared/kernel/$1",
    "^@shared-domain/(.*)$": "<rootDir>/src/shared/domain/$1",
    "^@shared-infrastructure/(.*)$": "<rootDir>/src/shared/infrastructure/$1",

    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
    "^@users/(.*)$": "<rootDir>/src/modules/users/$1",
    "^@users-domain/(.*)$": "<rootDir>/src/modules/users/domain/$1",
    "^@users-application/(.*)$": "<rootDir>/src/modules/users/application/$1",
    "^@users-infrastructure/(.*)$": "<rootDir>/src/modules/users/infrastructure/$1",

	  "^@prisma-generated/(.*)$": "<rootDir>/generated/prisma/$1",
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  roots: ['<rootDir>/src'],
  // setupFiles: ['<rootDir>/setupTests.ts'],
  testEnvironment: "node",
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
};

export default config;