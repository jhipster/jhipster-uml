'use strict';

var modelio = require('./editors').MODELIO,
    umldesigner = require('./editors').UMLDESIGNER,
    genmymodel = require('./editors').GENMYMODEL,
    visualparadigm = require('./editors').VISUALPARADIGM;

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
  } else if (root.eAnnotations
      && root.eAnnotations[0].$.source === 'genmymodel') {
    console.info('Parser detected: GENMYMODEL.\n');
    return genmymodel;
  } else if(root['xmi:Documentation']
      && root['xmi:Documentation'][0].$.exporter === 'Visual Paradigm') {
    console.info('Parser detected: VISUAL PARADIGM.\n');
    return visualparadigm;
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
      message: 'Please choose between the available Editors:',
      choices: ['Modelio', 'UML Designer', 'GenMyModel', 'Visual Paradigm'],
      filter: function(val) {
        switch (val) {
          case 'UML Designer':
            return umldesigner;
          case 'Visual Paradigm':
            return visualparadigm;
          default:
            return val.toLowerCase();
        }
      }
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
