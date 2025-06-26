//ejecutador
import app from './app.js';
import logger from './logs/logger.js';
import 'dotenv/config'; // Load environment variables from .env file
import config from './config/env.js'
import { sequelize } from './database/database.js';

async function main() {
    await sequelize.sync({force: false});
    const port = config.PORT;
    app.listen(port);
    logger.info('Server is running on ' + port);
    logger.error('This is an error message');
    logger.warn('This is a warning message');
    logger.debug('This is a debug message');
    logger.fatal('This is a fatal message');
    logger.trace('This is a trace message');
}

main();