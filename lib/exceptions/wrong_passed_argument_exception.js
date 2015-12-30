'use strict';

var WrongPassedArgumentException = module.exports = function(message) {
  this.name = 'WrongPassedArgumentException';
  this.message = (message || '');
};
WrongPassedArgumentException.prototype = new Error();
