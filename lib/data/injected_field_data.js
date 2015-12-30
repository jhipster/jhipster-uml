'use strict';

var merge = require('../helpers/object_helper').merge;

/**
 * The class holding injected field data.
 */
var InjectedFieldData = module.exports = function (values) {
  var defaults = {
    name: '',
    customName: '',
    type: '',
    association: '',
    'class': '',
    isUpperValuePresent: false,
    cardinality: '',
    comment: '',
    otherSideComment: ''
  };

  var merged = merge(defaults, values);
  this.name = merged.name;
  this.customName = merged.customName;
  this.type = merged.type;
  this.association = merged.association;
  this['class'] = merged['class'];
  this.isUpperValuePresent = merged.isUpperValuePresent;
  this.cardinality = merged.cardinality;
  this.comment = merged.comment;
  this.otherSideComment = merged.otherSideComment;
};
