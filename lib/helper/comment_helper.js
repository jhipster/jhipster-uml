'use strict';

var formatComment = module.exports = function(comment) {
  var parts = comment.trim().split('\n');
  if (parts.length === 1) {
    return parts[0];
  }
  var formatted = '';
  parts.forEach(function(part) {
    console.log('>>>>>>>>>>>>>>>>>>>>> ' + part);
    formatted = formatted.concat(part.trim().replace(/[*]*\s*/, ''));
  });
  return formatted;
};
