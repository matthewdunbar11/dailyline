module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.expo/'],
  moduleNameMapper: {
    '^expo-file-system$': '<rootDir>/src/test-utils/expoFileSystemMock.ts',
    '^expo-notifications$': '<rootDir>/src/test-utils/expoNotificationsMock.ts',
    '^expo-sharing$': '<rootDir>/src/test-utils/expoSharingMock.ts'
  }
};
