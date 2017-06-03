/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const modelio = require('./editors').MODELIO,
  genmymodel = require('./editors').GENMYMODEL,
  UndetectedEditors = require('./editors').UndetectedEditors,
  selectMultipleChoices = require('../helpers/question_asker').selectMultipleChoices,
  buildException = require('../exceptions/exception_factory').buildException,
  exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  detect: detect
};

/**
 * Detects the editor that made the document represented by its passed root.
 * @param root {Object} the document's root.
 * @return {string} the editor's name.
 */
function detect(root) {
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
  }

  if (UndetectedEditors.length === 0) {
    // this should not be happening
    throw new buildException(exceptions.UndetectedEditor,
      'Your editor has not been detected, and this should not be happening.'
      + '\nPlease report this issue by mentioning what your editor is.');
  }
  return askForEditor();
}

function askForEditor() {
  const choices = UndetectedEditors;
  choices.push({
    value: 'ERROR',
    name: "I don't see my editor."
  });
  const choice = selectMultipleChoices({
    choices: choices,
    question: 'Please choose between the available editors:'
  });
  if (choice[0] === 'ERROR') {
    throw new buildException(exceptions.UndetectedEditor,
      'You should report this issue by mentioning what your editor is.');
  }
  return choice;
}
