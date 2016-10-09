'use strict';

var expect = require('chai').expect,
    fail = expect.fail,
    EditorDetector = require('../../lib/editors/editor_detector');

describe('EditorDetector#detect', () => {
  describe('when passing an invalid root', () => {
    describe('because it is null', () => {
      it('throws an exception', () => {
        try {
          EditorDetector.detect(null);
          fail();
        } catch (error) {
          expect(error.name).to.equal('NullPointerException');
        }
      });
    });
  });

  describe('when passing a possibly valid root', () => {
    describe('when passing a root from a recognized editor', () => {
      var detected = EditorDetector.detect({
        eAnnotations: [
          {
            $: {
              source: 'Objing'
            }
          }
        ]
      });

      it("returns the editor's name", () => {
        expect(detected).to.equal('modelio');
      });
    });
  });
});
