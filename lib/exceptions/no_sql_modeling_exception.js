'use strict';

var NoSQLModelingException = module.exports = function(message) {
  this.name = 'NoSQLModelingException';
  this.message = (message || '');
};
NoSQLModelingException.prototype = new Error();
