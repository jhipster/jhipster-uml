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
const inquirer = require('inquirer');
const deasync = require('deasync');
const merge = require('jhipster-core').ObjectUtils.merge;

module.exports = {
  askConfirmation,
  selectMultipleChoices,
  selectSingleChoice,
  askForInput
};

const DEFAULTS = {
  QUESTION_TYPES: {
    CHECKBOX: 'checkbox',
    LIST: 'list',
    CONFIRM: 'confirm',
    INPUT: 'input'
  },
  CONFIRMATIONS: {
    question: 'Confirm?',
    default: true
  },
  SINGLE_CHOICES: {
    name: 'answer',
    question: 'Choose one among:'
  },
  MULTIPLE_CHOICES: {
    name: 'answer',
    question: 'Choose as many as you want among:'
  },
  INPUT: {
    question: 'Enter the value:'
  },
  NOTHING: []
};

/**
 * Asks the user for an input.
 * @param args {object} keys: question
 * @return {string} the user's answer.
 */
function askForInput(args) {
  let userAnswer = null;
  const merged = merge(DEFAULTS.INPUT, args);
  inquirer.prompt([
    {
      type: DEFAULTS.QUESTION_TYPES.INPUT,
      name: 'value',
      message: merged.question,
      validate: (value) => {
        const pass = value.match(/^[A-z0-9-_]+$/);
        if (pass) {
          return true;
        }
        return 'The passed value is invalid, only alphabetical characters, \'-\' and \'_\' are allowed.';
      }
    }
  ]).then((answer) => {
    userAnswer = answer.value;
  });
  while (!userAnswer) {
    wait(100);
  }
  return userAnswer;
}

/**
 * Asks the user for confirmation.
 * @param args {object} keys: question, defaultValue
 * @return {boolean} the user's answer.
 */
function askConfirmation(args) {
  let userAnswer = 'no-answer';
  const merged = merge(DEFAULTS.CONFIRMATIONS, args);
  inquirer.prompt([
    {
      type: DEFAULTS.QUESTION_TYPES.CONFIRM,
      name: 'choice',
      message: merged.question,
      default: merged.defaultValue
    }
  ]).then((answer) => {
    userAnswer = answer.choice;
  });
  while (userAnswer === 'no-answer') {
    wait(100);
  }
  return userAnswer;
}

/**
 * Asks the user for a choice.
 * @param args {object} keys: classes, choices, question, filterFunction
 * @return the choice.
 */
function selectSingleChoice(args) {
  args.choices = args.choices || prepareChoices(args.classes);
  let result = null;
  const merged = merge(DEFAULTS.SINGLE_CHOICES, args);
  inquirer.prompt([
    {
      type: DEFAULTS.QUESTION_TYPES.LIST,
      name: 'answer',
      message: merged.question,
      choices: merged.choices,
      filter: merged.filterFunction
    }
  ]).then((answers) => {
    result = answers.answer;
  });
  while (!result) {
    wait(100);
  }
  return result;
}

/**
 * Asks the user for one, or more choices.
 * @param args {object} keys: classes, choices, question, filterFunction
 * @return the choice.
 */
function selectMultipleChoices(args) {
  args.choices = args.choices || prepareChoices(args.classes);
  let result = null;
  const merged = merge(DEFAULTS.MULTIPLE_CHOICES, args);
  inquirer.prompt([
    {
      type: DEFAULTS.QUESTION_TYPES.CHECKBOX,
      name: 'answer',
      message: merged.question,
      choices: merged.choices,
      filter: merged.filterFunction
    }
  ]).then((answers) => {
    if (answers.answer.length === 0) {
      result = DEFAULTS.NOTHING;
    } else {
      result = answers.answer;
    }
  });
  while (!result) {
    wait(100);
  }
  return result;
}

function prepareChoices(classes) {
  return Object.keys(classes).map(classId => classes[classId].name);
}

function wait(time) {
  deasync.sleep(time);
}
