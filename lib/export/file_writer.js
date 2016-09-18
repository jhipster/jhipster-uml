'use strict';

const fs = require('fs');

module.exports = {
  /**
   * args: {
   *   fileName: string,
   *   content: string
   * }
   */
  writeFile: writeFile
};

function writeFile(args) {
  fs.writeFileSync(args.fileName, args.content, null, '  ');
}
