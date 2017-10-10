module.exports = wallaby => {
  process.env.NODE_ENV = 'test';

  return {
    testFramework: 'jest',
    files: [
      'package.json',
      'src/**/*.js',
      '!src/**/*.test.js'
    ],
    tests: [
      'src/**/*.test.js',
    ],
    env: {
      type: 'node',
      runner: 'node'
    },
    compilers: {
      'src/**/*.js': wallaby.compilers.babel()
    },
    setup(wallaby) {
      wallaby.testFramework.configure(require('./package.json').jest);
    }
  };
};
