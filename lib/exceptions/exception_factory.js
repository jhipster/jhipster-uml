'use strict';

const EXCEPTIONS = {
  CircularDependency: null,
  IllegalArgument: null,
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
  var exception = {
    name: `${name}Exception`,
    message: (message || '')
  };
  exception.prototype = new Error();
  return exception;
}
