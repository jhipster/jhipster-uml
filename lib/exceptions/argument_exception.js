'use strict';

var ArgumentException = module.exports = function(message) {
  this.name = 'ArgumentException';
  this.message = (message || '');
};
ArgumentException.prototype = new Error();
