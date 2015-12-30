'use strict';

var expect = require('chai').expect,
    fail = expect.fail,
    EditorDetector = require('../../lib/editors/editor_detector');

describe('EditorDetector#detect', function() {
  describe('when passing an invalid root', function() {
    describe('because it is null', function() {
      it('throws an exception', function() {
        try {
          EditorDetector.detect(null);
          fail();
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
