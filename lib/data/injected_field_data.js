'use strict';

var merge = require('../helper/object_helper').merge;

var InjectedFieldData = module.exports = function (values) {
  var defaults = {
    name: '',
    type: '',
    association: '',
    classId: '',
    isUpperValuePresent: false,
    cardinality: ''
  };

  var merged = merge(defaults, values);
  this.name = merged.name;
  this.type = merged.type;
  this.association = merged.association;
  this.classId = merged.classId;
  this.isUpperValuePresent = merged.isUpperValuePresent;
  this.cardinality = merged.cardinality;
};
