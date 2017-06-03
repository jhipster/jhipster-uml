'use strict';

const expect = require('chai').expect,
  formatComment = require('../../lib/helpers/comment_helper').formatComment;

describe('#formatComment', () => {
  describe('when the comment is in the one-line form', () => {
    const oneLineComment1 = ' comment ';
    const oneLineComment2 = 'comment';
    const oneLineComment3 = ' * a one line comment. ';
    const oneLineComment4 = ' multi word\tcomment ';
    const oneLineComment5 = 'multi word\tcomment';
    const expectedResult1 = 'comment';
    const expectedResult2 = 'a one line comment.';
    const expectedResult3 = 'multi word\tcomment';

    describe(buildTestTitle(oneLineComment1), () => {
      it('returns ' + buildTestTitle(expectedResult1), () => {
        expect(formatComment(oneLineComment1)).to.eq(expectedResult1);
      });
    });
    describe(buildTestTitle(oneLineComment2), () => {
      it('returns ' + buildTestTitle(expectedResult1), () => {
        expect(formatComment(oneLineComment2)).to.eq(expectedResult1);
      });
    });
    describe(buildTestTitle(oneLineComment3), () => {
      it('returns ' + buildTestTitle(expectedResult2), () => {
        expect(formatComment(oneLineComment3)).to.eq(expectedResult2);
      });
    });
    describe(buildTestTitle(oneLineComment4), () => {
      it('returns ' + buildTestTitle(expectedResult3), () => {
        expect(formatComment(oneLineComment4)).to.eq(expectedResult3);
      });
    });
    describe(buildTestTitle(oneLineComment5), () => {
      it('returns ' + buildTestTitle(expectedResult3), () => {
        expect(formatComment(oneLineComment5)).to.eq(expectedResult3);
      });
    });
  });

  describe('when the comment is in the multi-line form', () => {
    const multiLineComment1 = "\n* <p>first line of comment</p><br/>\n*<p>second line</p>\n";
    const multiLineComment2 = "*** <p>first line of comment</p><br/>\n* *<p>second line</p>\n\n";
    const multiLineComment3 = "\n * abcde\n * fghij\n * nothing\n";
    const expectedResult1 = "<p>first line of comment</p><br/><p>second line</p>";
    const expectedResult2 = "<p>first line of comment</p><br/>*<p>second line</p>";
    const expectedResult3 = "abcdefghijnothing";

    describe(buildTestTitle(multiLineComment1), () => {
      it('returns ' + buildTestTitle(expectedResult1), () => {
        expect(formatComment(multiLineComment1)).to.eq(expectedResult1);
      });
    });
    describe(buildTestTitle(multiLineComment2), () => {
      it('returns ' + buildTestTitle(expectedResult2), () => {
        expect(formatComment(multiLineComment2)).to.eq(expectedResult2);
      });
    });
    describe(buildTestTitle(multiLineComment3), () => {
      it('returns ' + buildTestTitle(expectedResult3), () => {
        expect(formatComment(multiLineComment3)).to.eq(expectedResult3);
      });
    });
  });
});

function buildTestTitle(comment) {
  return `'${comment}'`;
}
