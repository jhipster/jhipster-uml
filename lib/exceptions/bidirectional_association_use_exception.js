'use strict';

var BidirectionalAssociationUseException = module.exports = function(message) {
  this.name = 'BidirectionalAssociationUseException';
  this.message = (message || '');
};
BidirectionalAssociationUseException.prototype = new Error();
