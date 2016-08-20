'use strict';

const buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

const options = {
  files: [],
  db: false,
  type: '',
  force: false,
  dto: false,
  dtoValue: null,
  pagination: false,
  paginationValue: null,
  service: false,
  serviceValue: null,
  skipClient: false,
  skipServer: false,
  angularSuffix: false,
  angularSuffixValue: null,
  microserviceName: false,
  microserviceNameValue: null,
  searchEngine: false,
  searchEngineValue: null,
  displayHelp: false,
  displayVersion: false
};

module.exports = {
  parseOptions: parseOptions
};

function parseOptions(args) {
  if (!args || args.length < 3) {
    throw new buildException(
        exceptions.IllegalArgument, 'The passed args must be valid.');
  }
  for (let i = 2; i < args.length; i++) {
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
        if (isAValue(args[i + 1])) {
          options.dtoValue = args[i + 1];
          i++;
        }
        break;
      case '-paginate':
        options.paginate = true;
        if (isAValue(args[i + 1])) {
          options.paginationValue = args[i + 1];
          i++;
        }
        break;
      case '-service':
        options.service = true;
        if (isAValue(args[i + 1])) {
          options.serviceValue = args[i + 1];
          i++;
        }
        break;
      case '-skip-client':
        options.skipClient = true;
        break;
      case '-skip-server':
        options.skipServer = true;
        break;
      case '-angular-suffix':
        options.angularSuffix = true;
        if (isAValue(args[i + 1])) {
          options.angularSuffixValue = args[i + 1];
          i++;
        }
        break;
      case '-microservice-name':
        options.microserviceName = true;
        if (isAValue(args[i + 1])) {
          options.microserviceNameValue = args[i + 1];
          i++;
        }
        break;
      case '-search-engine':
        options.searchEngine = true;
        if (isAValue(args[i + 1])) {
          options.searchEngineValue = args[i + 1];
          i++;
        }
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
}

function isAValue(nextOption) {
  return nextOption.indexOf('-') === -1;
}
