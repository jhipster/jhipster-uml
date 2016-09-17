'use strict';

const fs = require('fs');

module.exports = {
  writeFile: writeFile
};

/**
 * args: {
 *   fileName: string,
 *   content: string
 * }
 */
function writeFile(args) {
  fs.writeFileSync(args.fileName, args.content, null, '  ');
}
