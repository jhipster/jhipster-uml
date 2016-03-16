'use strict';

var WrongPassedArgumentException = require('../exceptions/wrong_passed_argument_exception');

var options = {
  files: [],
  db: false,
  type: '',
  force: false,
  dto: false,
  pagination: false,
  service: false,
  displayHelp: false,
  displayVersion: false
};

var parseOptions = module.exports = function (args) {
  if (!args || args.length < 3) {
    throw new WrongPassedArgumentException('The passed args must be valid.');
  }
  for (var i = 2; i < args.length; i++) {
    switch (args[i]) {
      case '-db':
        options.db = true;
        options.type = args[i + 1];
        i++;
        break;
      case '-f':
      case '-force':
        options.force = true;
        break;
      case '-dto':
        options.dto = true;
        break;
      case '-paginate':
        options.paginate = true;
        break;
      case '-service':
        options.service = true;
        break;
      case '-h':
      case '-help':
        options.displayHelp = true;
        return options;
      case '-v':
      case '-version':
        options.displayVersion = true;
        return options;
      default:
        options.files.push(args[i]);
    }
  }
  return options;
};