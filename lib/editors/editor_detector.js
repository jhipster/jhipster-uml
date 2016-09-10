'use strict';

const modelio = require('./editors').MODELIO,
    umldesigner = require('./editors').UMLDESIGNER,
    genmymodel = require('./editors').GENMYMODEL,
    //visualparadigm = require('./editors').VISUALPARADIGM,
    UndetectedEditors = require('./editors').UndetectedEditors,
    selectMultipleChoices = require('../helpers/question_asker').selectMultipleChoices,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

/**
 * Detects the editor that made the document represented by its passed root.
 * @param root {Object} the document's root.
 * @return {string} the editor's name.
 */
exports.detect = function (root) {
  if (!root) {
    throw new buildException(
        exceptions.NullPointer, 'The root element can not be null.');
  }
  if (root.eAnnotations && root.eAnnotations[0].$.source === 'Objing') {
    console.info('Parser detected: MODELIO.\n');
    return modelio;
  } else if (root.eAnnotations
      && root.eAnnotations[0].$.source === 'genmymodel') {
    console.info('Parser detected: GENMYMODEL.\n');
    return genmymodel;
  //} else if (root['xmi:Documentation']
  //    && root['xmi:Documentation'][0].$.exporter === 'Visual Paradigm') {
  //  console.info('Parser detected: VISUAL PARADIGM.\n');
   // return visualparadigm;
  }

  if (UndetectedEditors.length === 0) {
    // this should not be happening
    throw new buildException(exceptions.UndetectedEditor,
        'Your editor has not been detected, and this should not be happening.'
        + '\nPlease report this issue by mentioning what your editor is.');
  }
  return askForEditor();
};

function askForEditor() {
  var choices = UndetectedEditors;
  choices.push({
    value: 'ERROR',
    name: "I don't see my editor."
  });
  var choice = selectMultipleChoices({
    choices: choices,
    question: 'Please choose between the available editors:'
  });
  if (choice == 'ERROR') {
    throw new buildException(exceptions.UndetectedEditor,
        'You should report this issue by mentioning what your editor is.');
  }
  return choice;
}
