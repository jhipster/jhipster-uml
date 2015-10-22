'use strict';

var WrongDatabaseTypeException = module.exports = function(message) {
  this.name = 'WrongDatabaseTypeException';
  this.message = (message || '');
};
WrongDatabaseTypeException.prototype = new Error();
