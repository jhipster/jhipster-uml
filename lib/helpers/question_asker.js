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
    message: 'Choose one among:',
    filter: defaultFilterFunction
  },
  MULTIPLE_CHOICES: {
    name: 'answer',
    message: 'Choose as many as you want among:',
    filter: defaultFilterFunction
  },
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
 * @param args {object} keys: classes, question, filterFunction, resultHandlingFunction
 * @return the choice.
 */
function selectSingleChoice(args) {
  args.choices = prepareChoices(args.classes, false);
  choiceSelection(DEFAULTS.QUESTION_TYPES.LIST, merge(DEFAULTS.SINGLE_CHOICES, args));
}

/**
 * Asks the user for one, or more choices.
 * @param args {object} keys: classes, question, filterFunction, resultHandlingFunction
 * @return the choice.
 */
function selectMultipleChoices(args) {
  args.choices = prepareChoices(args.classes, true);
  choiceSelection(DEFAULTS.QUESTION_TYPES.CHECKBOX, merge(DEFAULTS.MULTIPLE_CHOICES, args));
}

function choiceSelection(choiceType, args) {
  inquirer.prompt([
    {
      type: choiceType,
      name: 'answer',
      message: args.question,
      choices: args.choices,
      filter: args.filterFunction
    }
  ]).then(args.resultHandlingFunction);
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

function defaultSingleResultHandlingFunction(answers) {

}

function defaultMultipleResultsHandlingFunction(answers) {

}

function wait(time) {
  deasync.sleep(time);
}
