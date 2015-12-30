'use strict';

var UndeclaredEntityException = module.exports = function(message) {
  this.name = 'UndeclaredEntityException';
  this.message = (message || '');
};
UndeclaredEntityException.prototype = new Error();
