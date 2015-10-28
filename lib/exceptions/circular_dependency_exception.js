'use strict';

var CircularDependencyException = module.exports = function(message) {
  this.name = 'CircularDependencyException';
  this.message = (message || '');
};
CircularDependencyException.prototype = new Error();
