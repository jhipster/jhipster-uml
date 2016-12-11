'use strict';

const buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

const WIN_PLATFORM = process.platform === 'win32';

module.exports = class JHipsterCommandBuilder {
  constructor() {
    this.args = [];
    this.stdio = [ process.stdin, process.stdout, process.stderr ];
    this.classNameToGenerate = null;
  }

  className(classNameToGenerate) {
    if (!classNameToGenerate || classNameToGenerate.length === 0) {
      throw new buildException(exceptions.IllegalArgument, 'The class name must be valid.');
    }
    this.classNameToGenerate = classNameToGenerate;
    return this;
  };
  force() {
    this.args.push('--force');
    return this;
  };
  skipClient() {
    this.args.push('--skip-client');
    return this;
  };
  skipServer() {
    this.args.push('--skip-server');
    return this;
  }
  noFluentMethods() {
    this.args.push('--no-fluent-methods');
    return this;
  };
  angularSuffix(angularSuffix) {
    this.args.push('--angular-suffix');
    this.args.push(angularSuffix);
  };
  skipUserManagement() {
    this.args.push('--skip-user-management');
    return this;
  }
  skipInstall() {
    this.args.push('--skip-install');
    return this;
  }
  build() {
    if (!this.classNameToGenerate) {
      throw new buildException(exceptions.IllegalState, 'A class name must be passed in order to build a command.');
    }
    this.args.push('regenerate');
    return {
      command: getCommand(),
      args: getFirstArgs(this.classNameToGenerate).concat(this.args),
      stdio: this.stdio
    };
  }
};

function getCommand() {
  return WIN_PLATFORM ? (process.env.comspec || 'cmd.exe') : 'yo';
}

function getFirstArgs(classNameToGenerate) {
  return (WIN_PLATFORM ? [ '/s', '/c', 'yo jhipster:entity' ] : [ 'jhipster:entity' ])
    .concat(classNameToGenerate);
}
