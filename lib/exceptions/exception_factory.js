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

/**
 * This constant is where all the error cases go.
 * No need to assign anything to the keys, the following loop will take care of
 * that.
 */
const EXCEPTIONS = {
  IllegalArgument: null,
  IllegalName: null,
  IllegalState: null,
  MalformedAssociation: null,
  NoRoot: null,
  NoSQLModeling: null,
  NullPointer: null,
  UndeclaredEntity: null,
  UndetectedEditor: null,
  UnimplementedOperation: null,
  WrongAssociation: null,
  WrongCall: null,
  WrongDatabaseType: null,
  WrongField: null,
  WrongFile: null,
  WrongType: null,
  WrongValidation: null
};

for (let key in EXCEPTIONS) {
  EXCEPTIONS[key] = key;
}

module.exports = {
  exceptions: EXCEPTIONS,
  buildException: buildException
};

function buildException(name, message) {
  const exception = {
    name: name ? `${name}Exception` : 'Exception',
    message: (message || '')
  };
  exception.prototype = new Error();
  return exception;
}
