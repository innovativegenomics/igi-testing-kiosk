const pino = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
(async () => {
  const app = await require('./app')();
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    pino.info(`Server up and running on port ${port} !`);
  });
})();
