'use strict';

var AssociationException = module.exports = function(message) {
  this.name = 'AssociationException';
  this.message = (message || '');
};
AssociationException.prototype = new Error();
