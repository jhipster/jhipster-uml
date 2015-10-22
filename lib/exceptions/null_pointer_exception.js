'use strict';

var NullPointerException = module.exports = function(message) {
  this.name = 'NullPointerException';
  this.message = (message || '');
};
NullPointerException.prototype = new Error();
