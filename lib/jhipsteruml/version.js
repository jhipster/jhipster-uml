'use strict';

exports.displayVersion = function() {
  console.info('The current version of JHipster UML is ' + getPackageVersion() + '.');
};

function getPackageVersion() {
  var packageJsonFile = require('../../package.json');
  return packageJsonFile.version;
}
