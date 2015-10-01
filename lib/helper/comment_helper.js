'use strict';

var formatComment = module.exports = function(comment) {
  if (!comment) {
    return;
  }
  var parts = comment.trim().split('\n');
  if (parts.length === 1 && parts[0].indexOf('*') !== 0) {
    return parts[0];
  }
  var formatted = '';
  parts.forEach(function(part) {
    formatted = formatted.concat(part.trim().replace(/[*]*\s*/, ''));
  });
  return formatted;
};
