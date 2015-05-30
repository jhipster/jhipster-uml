'use strict';

var modelio = require('./editors').MODELIO;

exports.detect = function detect(root) {
  if (!root) {
    throw new NullPointerException('The root element can not be null.');
  }
  if (root.eAnnotations && root.eAnnotations[0].$['source'] == 'Objing') {
    return modelio;
  } else {
    console.log('Your editor is unknown');
  }
};

function NullPointerException(message) {
  this.name = 'NullPointerException';
  this.message = (message || '');
}
NullPointerException.prototype = new Error();
