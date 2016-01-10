'use strict';

var merge = require('../helpers/object_helper').merge;

/**
 * The class holding association data.
 */
var AssociationData = module.exports = function(values) {
  var defaults = {
    from: null,
    to: null,
    type: '',
    injectedFieldInFrom: null,
    injectedFieldInTo: null,
    commentInFrom: null,
    commentInTo: null
  };

  var merged = merge(defaults, values);
  this.from = merged.from;
  this.to = merged.to;
  this.type = merged.type;
  this.injectedFieldInFrom = merged.injectedFieldInFrom;
  this.injectedFieldInTo = merged.injectedFieldInTo;
  this.commentInFrom = merged.commentInFrom;
  this.commentInTo = merged.commentInTo;
};
