'use strict';

const inquirer = require('inquirer'),
    merge = require('../helpers/object_helper').merge;

module.exports = {
  askConfirmation: askConfirmation,
  selectMultipleChoices: selectMultipleChoices,
  selectSingleChoice: selectSingleChoice
};

const QUESTION_TYPES = {
  CHECKBOX: 'checkbox',
  LIST: 'list',
  CONFIRM: 'confirm'
};

/**
 * Asks the user for confirmation.
 * @param args {object} keys: message, defaultValue
 * @return {boolean} the user's answer.
 */
function askConfirmation(args) {
  var userAnswer = 'no-answer';
  inquirer.prompt([
        {
          type: QUESTION_TYPES.CONFIRM,
          name: 'choice',
          message: args.message,
          default: args.defaultValue
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
 * @param args {object} keys: choices, question, filterFunction, resultHandlingFunction
 * @return the choice.
 */
function selectSingleChoice(args) {
  choiceSelection(QUESTION_TYPES.LIST, args);
}

/**
 * Asks the user for one, or more choices.
 * @param args {object} keys: choices, question, filterFunction, resultHandlingFunction
 * @return the choice.
 */
function selectMultipleChoices(args) {
  choiceSelection(QUESTION_TYPES.CHECKBOX, args);
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

function defaultFilterFunction(value) {
  return value;
}

function defaultSingleResultHandlingFunction(answers) {

}

function defaultMultipleResultsHandlingFunction(answers) {

}

function wait(time) {
  require('deasync').sleep(time);
}
