'use strict';

const merge = require('../utils/object_utils').merge;

/**
 * The class holding association data.
 */
class AssociationData {
  constructor(values) {
    var merged = merge(defaults(), values);
    this.from = merged.from;
    this.to = merged.to;
    this.type = merged.type;
    this.injectedFieldInFrom = merged.injectedFieldInFrom;
    this.injectedFieldInTo = merged.injectedFieldInTo;
    this.isInjectedFieldInFromRequired = merged.isInjectedFieldInFromRequired;
    this.isInjectedFieldInToRequired = merged.isInjectedFieldInToRequired;
    this.commentInFrom = merged.commentInFrom;
    this.commentInTo = merged.commentInTo;
  }
}

module.exports = AssociationData;

function defaults() {
  return {
    from: null,
    to: null,
    type: '',
    injectedFieldInFrom: null,
    injectedFieldInTo: null,
    isInjectedFieldInFromRequired: false,
    isInjectedFieldInToRequired: false,
    commentInFrom: '',
    commentInTo: ''
  };
}
