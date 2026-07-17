module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  transformIgnorePatterns: [
    '/node_modules/(?!(@ham2k/lib-[^/]+)/)'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/jest.mock.cjs',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/jest.mock.cjs',
    '^@ham2k/lib-qson-tools$': '<rootDir>/node_modules/@ham2k/lib-qson-tools/dist/index.js',
    '^@ham2k/lib-qson-adif$': '<rootDir>/node_modules/@ham2k/lib-qson-adif/src/index.js',
    '^react-router-dom$': '<rootDir>/node_modules/react-router-dom/dist/index.js',
    '^react-router/dom$': '<rootDir>/node_modules/react-router/dist/development/dom-export.js',
    '^react-router$': '<rootDir>/node_modules/react-router/dist/development/index.js'
  }
}
