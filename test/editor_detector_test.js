'use strict';

var chai = require('chai'),
    expect = chai.expect,
    EditorDetector = require('../lib/editors/editor_detector');

describe('EditorDetector#detect', function() {
  describe('when passing an invalid root', function() {
    describe('because it is null', function() {
      it('throws an exception', function() {
        try {
          EditorDetector.detect(null);
          throw new ExpectationError();
        } catch (error) {
          expect(error.name).to.equal('NullPointerException');
        }
      });
    });
  });

  describe('when passing a possibly valid root', function() {
    describe('when passing a root from a recognized editor', function() {
      it("returns the editor's name", function() {
        var detected = EditorDetector.detect({
          eAnnotations: [
            {
              $: {
                source: 'Objing'
              }
            }
          ]
        });
        expect(detected).to.equal('modelio');
      });
    });
  });
});

function ExpectationError(message) {
  this.name = 'ExpectationError';
  this.message = (message || '');
}
ExpectationError.prototype = new Error();
