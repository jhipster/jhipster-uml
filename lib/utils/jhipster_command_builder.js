'use strict';

const Set = require('jhipster-core').Set,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

const WIN_PLATFORM = process.platform === 'win32';

class JHipsterCommandBuilder {
  constructor() {
    this.args = new Set();
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
    this.args.add('--force');
    return this;
  };
  skipClient() {
    this.args.add('--skip-client');
    return this;
  };
  skipServer() {
    this.args.add('--skip-server');
    return this;
  }
  noFluentMethods() {
    this.args.add('--no-fluent-methods');
    return this;
  };
  angularSuffix(angularSuffix) {
    this.args.add('--angular-suffix');
    this.args.add(angularSuffix);
  };
  skipUserManagement() {
    this.args.add('--skip-user-management');
    return this;
  }
  skipInstall() {
    this.args.add('--skip-install');
    return this;
  }
  build() {
    if (!className) {
      throw new buildException(exceptions.IllegalState, 'A class name must be passed in order to build a command.');
    }
    this.args.add('regenerate');
    return {
      command: getCommand(),
      args: getFirstArgs().concat(args),
      stdio: stdio
    };
  }
}

module.exports = JHipsterCommandBuilder;

function setCommand() {
  return WIN_PLATFORM ? (process.env.comspec || 'cmd.exe') : 'yo';
}

function getFirstArgs() {
  return (WIN_PLATFORM ? [ '/s', '/c', 'yo jhipster:entity' ] : [ 'jhipster:entity' ])
    .concat(jhipsterCommandBuilder.classNameToGenerate);
}
