'use strict';

var NoCardinalityException = module.exports = function(message) {
  this.name = 'NoCardinalityException';
  this.message = (message || '');
};
NoCardinalityException.prototype = new Error();
