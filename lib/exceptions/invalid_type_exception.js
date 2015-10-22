'use strict';

var InvalidTypeException = module.exports = function(message) {
  this.name = 'InvalidTypeException';
  this.message = (message || '');
};
InvalidTypeException.prototype = new Error();
