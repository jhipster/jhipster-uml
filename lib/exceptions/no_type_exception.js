'use strict';

var NoTypeException = module.exports = function(message) {
  this.name = 'NoTypeException';
  this.message = (message || '');
};
NoTypeException.prototype = new Error();
