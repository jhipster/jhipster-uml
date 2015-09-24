'use strict';

exports.formatComment = function(comment) {
  var formattedComment = comment.trim();
  var parts = formattedComment.split(/\n *\s?/);
  if (parts.length === 1) { // the /** comment */ case
    return formattedComment;
  }
  parts.shift();
  parts.pop();
  parts.each(function(part) {
    if (part.indexOf('*') === 0) {
      formattedComment.concat(part.trim()).concat('<br/>').concat('\n');
    }
  });
  return formattedComment.trim();
};
