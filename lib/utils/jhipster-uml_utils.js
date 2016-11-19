'use strict';

const fs = require('fs');

module.exports = {
  isJumlFilePresent: isJumlFilePresent
};

function isJumlFilePresent() {
  try {
    fs.statSync('.juml').isFile();
    return true;
  } catch (error) {
    return false;
  }
}
