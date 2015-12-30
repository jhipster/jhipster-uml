'use strict';

var UndetectedEditorException = module.exports = function(message) {
  this.name = 'UndetectedEditorException';
  this.message = (message || '');
};
UndetectedEditorException.prototype = new Error();
