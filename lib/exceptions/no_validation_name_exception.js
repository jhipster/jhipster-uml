'use strict';

var NoValidationNameException = module.exports = function(message) {
  this.name = 'NoValidationNameException';
  this.message = (message || '');
};
NoValidationNameException.prototype = new Error();
