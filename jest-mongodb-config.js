module.exports = {
  mongodbMemoryServerOptions: {
    instance: {
      dbName: 'jest',
    },
    binary: {
      version: '4.0.20',
      skipMD5: true,
    },
    autoStart: false,
  },
};
