'use strict';

const inquirer = require('inquirer'),
    deasync = require('deasync'),
    merge = require('../utils/object_utils').merge;

module.exports = {
  askConfirmation: askConfirmation,
  selectMultipleChoices: selectMultipleChoices,
  selectSingleChoice: selectSingleChoice
};

const DEFAULTS = {
  QUESTION_TYPES: {
    CHECKBOX: 'checkbox',
    LIST: 'list',
    CONFIRM: 'confirm'
  },
  CONFIRMATIONS: {
    message: 'Confirm?',
    'default': true
  },
  SINGLE_CHOICES: {
    name: 'answer',
    message: 'Choose one among:'
  },
  MULTIPLE_CHOICES: {
    name: 'answer',
    message: 'Choose as many as you want among:'
  },
  NOTHING: [],
  EVERYTHING: '*** All ***'
};

/**
 * Asks the user for confirmation.
 * @param args {object} keys: message, defaultValue
 * @return {boolean} the user's answer.
 */
function askConfirmation(args) {
  var userAnswer = 'no-answer';
  var merged = merge(DEFAULTS.CONFIRMATIONS, args);
  inquirer.prompt([
        {
          type: DEFAULTS.QUESTION_TYPES.CONFIRM,
          name: 'choice',
          message: merged.message,
          default: merged.defaultValue
        }
      ]
  ).then(function (answer) {
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
  args.choices = args.choices || prepareChoices(args.classes, false);
  var merged = merge(DEFAULTS.SINGLE_CHOICES, args);
  var result = null;
  inquirer.prompt([
    {
      type: DEFAULTS.QUESTION_TYPES.LIST,
      name: 'answer',
      message: merged.question,
      choices: merged.choices,
      filter: merged.filterFunction
    }
  ]).then(function(answers) {
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
  args.choices = args.choices || prepareChoices(args.classes, true);
  var merged = merge(DEFAULTS.MULTIPLE_CHOICES, args);
  var result = null;
  inquirer.prompt([
    {
      type: DEFAULTS.QUESTION_TYPES.CHECKBOX,
      name: 'answer',
      message: merged.question,
      choices: merged.choices,
      filter: merged.filterFunction
    }
  ]).then(function(answers) {
    if (answers.answer.toString().length === 0) {
      result = DEFAULTS.NOTHING;
    } else {
      result = answers.answer.indexOf(DEFAULTS.EVERYTHING) !== -1
          ? merged.choices
          : answers.answer;
    }
  });
  while (!result) {
    wait(100);
  }
  return result;
}

function prepareChoices(classes, everyEntityFlag) {
  var choices = [];
  if (everyEntityFlag) {
    choices.push(DEFAULTS.EVERYTHING);
  }
  for (let i = 0; i < classes.length; i++) {
    choices.push(classes[i].name);
  }
  return choices;
}

function defaultFilterFunction(value) {
  return value;
}

function wait(time) {
  deasync.sleep(time);
}
