'use strict';

var modelio = require('./editors').MODELIO,
    genmymodel = require('./editors').GENMYMODEL;

/**
 * Detects the editor that made the document represented by its passed root.
 * @param root {Object} the document's root.
 * @return {string} the editor's name.
 */
exports.detect = function(root) {
  if (!root) {
    throw new NullPointerException('The root element can not be null.');
  }
  if (root.eAnnotations && root.eAnnotations[0].$.source === 'Objing') {
    console.info('Parser detected: MODELIO.\n');
    return modelio;
  } else if(root.eAnnotations && root.eAnnotations[0].$.source === 'genmymodel') {
    console.info('Parser detected: GENMYMODEL.\n');
    return genmymodel;
  }

  console.info('Your editor has not been detected.\n');
  return askForEditor();
};

function askForEditor() {
  var inquirer = require('inquirer');
  var choice = null;

  inquirer.prompt([
    {
      type: 'list',
      name: 'answer',
      message: 'Please choose between the available editors:',
      choices: ['Modelio', 'UMLDesigner', 'GenMyModel'],
      filter: function(val) { return val.toLowerCase(); }
    }
  ], function(answers) {
      choice = answers.answer;
    }
  );
  while(!choice) {
    require('deasync').sleep(100);
  }

  return choice;
}

function NullPointerException(message) {
  this.name = 'NullPointerException';
  this.message = (message || '');
}
NullPointerException.prototype = new Error();
