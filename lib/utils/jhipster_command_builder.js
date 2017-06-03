/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

const WIN_PLATFORM = process.platform === 'win32';

class JHipsterCommandBuilder {
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
    return this;
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
    return {
      command: getCommand(),
      args: getFirstArgs(this.classNameToGenerate).concat(this.args).concat('--regenerate'),
      stdio: this.stdio
    };
  }
}

module.exports = JHipsterCommandBuilder;

function getCommand() {
  return WIN_PLATFORM ? (process.env.comspec || 'cmd.exe') : 'yo';
}

function getFirstArgs(classNameToGenerate) {
  return (WIN_PLATFORM ? [ '/s', '/c', 'yo jhipster:entity' ] : [ 'jhipster:entity' ])
    .concat(classNameToGenerate);
}
