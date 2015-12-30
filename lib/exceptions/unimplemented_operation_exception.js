'use strict';

var UnimplementedOperationException = module.exports = function(message) {
  this.name = 'UnimplementedOperationException';
  this.message = (message || '');
};
UnimplementedOperationException.prototype = new Error();
