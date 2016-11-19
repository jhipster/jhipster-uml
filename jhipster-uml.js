#!/usr/bin/env node
'use strict';

const chalk = require('chalk');

try {
  require('./lib/jhipsteruml');
} catch (error) {
  console.error(`${chalk.red('An error has occurred:\n\t')}${error.name}`);
  console.error(`${chalk.red('Error message:\n\t')}${error.message}`);
  if (error.stack) {
    console.error(`${chalk.red('Stack trace:\n')}${error.stack}`);
  }
}
