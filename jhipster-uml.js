#!/usr/bin/env node

/* eslint-disable global-require */
const chalk = require('chalk');
const winston = require('winston');

try {
  require('./lib/jhipsteruml');
} catch (error) {
  winston.error(`${chalk.red('An error has occurred:\n\t')}${error.name}`);
  winston.error(`${chalk.red('Error message:\n\t')}${error.message}`);
  if (error.stack) {
    winston.error(`${chalk.red('Stack trace:\n')}${error.stack}`);
  } else if (error.prototype && error.prototype.stack) {
    winston.error(`${chalk.red('Stack trace:\n')}${error.prototype.stack}`);
  }
}
