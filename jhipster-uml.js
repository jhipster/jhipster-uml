#!/usr/bin/env node

/* eslint-disable global-require */
const chalk = require('chalk');
const logger = require('./lib/utils/logger');

try {
  require('./lib/jhipsteruml');
} catch (error) {
  logger.error(`${chalk.red('An error has occurred:\n\t')}${error.name}`);
  logger.error(`${chalk.red('Error message:\n\t')}${error.message}`);
  if (error.stack) {
    logger.error(`${chalk.red('Stack trace:\n')}${error.stack}`);
  } else if (error.prototype && error.prototype.stack) {
    logger.error(`${chalk.red('Stack trace:\n')}${error.prototype.stack}`);
  }
}
