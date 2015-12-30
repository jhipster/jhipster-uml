'use strict';

var WrongValidationException = module.exports = function(message) {
  this.name = 'WrongValidationException';
  this.message = (message || '');
};
WrongValidationException.prototype = new Error();
