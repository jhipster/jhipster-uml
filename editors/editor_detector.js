'use strict';

var util = require('util'),
    modelio = require('./editors').MODELIO,
    genmymodel = require('./editors').GENMYMODEL,
    umldesigner = require('./editors').UMLDESIGNER;

/**
 * Detects the editor that made the document represented by its passed root.
 * @param root {Object} the document's root.
 * @return {string} the editor's name.
 * @throws UnknownEditorException if no editor has been recognized.
 */
exports.detect = function detect(root) {
  if (!root) {
    throw new NullPointerException('The root element can not be null.');
  }
  if (root.eAnnotations && root.eAnnotations[0].$['source'] == 'Objing') {
    console.log('Parser detected: MODELIO.\n');
    return modelio;
  } else if(root.eAnnotations && root.eAnnotations[0].$['source'] == 'genmymodel') {
    console.log('Parser detected: GENMYMODEL.\n');
    return genmymodel;
  }

  console.log('Your editor has not been detected.\n');
  return askForEditor();
};

function askForEditor() {
  var inquirer = require('inquirer');
  var choice = null;

  inquirer.prompt([
    {
      type: 'list',
      name: 'answer',
      message: 'Please choose between the available editors;',
      choices: ['Modelio', 'UMLDesigner', 'GenMyModel'],
      filter: function(val) { return val.toLowerCase(); }
    }
  ], function(answers) {
      choice = answers['answer'];
    }
  );
  while(!choice) {
    require('deasync').sleep(100);
  }

  return choice;
}

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
