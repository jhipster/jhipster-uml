'use strict';

var modelio = require('./editors').MODELIO,
    umldesigner = require('./editors').UMLDESIGNER;

/**
 * Detects the editor that made the document represented by its passed root.
 * @param root {Object} the document's root.
 * @return {string} the editor's name.
 */
exports.detect = function detect(root) {
  if (!root) {
    throw new NullPointerException('The root element can not be null.');
  }
  if (root.eAnnotations && root.eAnnotations[0].$['source'] == 'Objing') {
    return modelio;
  } else { // TODO choose UML Designer
    throw new UnknownEditorException('Your editor is unknown');
  }
};

function UnknownEditorException(message) {
  this.name = 'UnknownEditorException';
  this.message = (message || '');
}
UnknownEditorException.prototype = new Error();

function NullPointerException(message) {
  this.name = 'NullPointerException';
  this.message = (message || '');
}
NullPointerException.prototype = new Error();
