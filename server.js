require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if(!MONGO_URI){
  console.error('MONGO_URI is required in environment');
  process.exit(1);
}

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    logger.info('Connected to MongoDB');
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = () => {
      logger.info('Shutting down server...');
      server.close(() => {
        mongoose.disconnect().then(()=> {
          logger.info('Mongo disconnected, exiting.');
          process.exit(0);
        });
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  })
  .catch(err => {
    logger.error('Mongo connection error', err);
    process.exit(1);
  });
