'use strict';

var NoRootElementException = module.exports = function(message) {
  this.name = 'NoRootElementException';
  this.message = (message || '');
};
NoRootElementException.prototype = new Error();
