const expect = require('chai').expect;
const getClassNames = require('../../lib/helpers/class_helper').getClassNames;

describe('#getClassNames', () => {
  describe('when passing a valid classes object', () => {
    const classDataHolder = {};
    before(() => {
      classDataHolder[0] = { name: 'a' };
      classDataHolder[1] = { name: 'b' };
      classDataHolder[2] = { name: 'c' };
      classDataHolder[3] = { name: 'd' };
    });

    it('returns the classes\' names', () => {
      expect(getClassNames(classDataHolder)).to.deep.equal({
        0: 'a', 1: 'b', 2: 'c', 3: 'd'
      });
    });
  });

  describe('when passing an invalid classes object', () => {
    describe('such as an empty object', () => {
      const classNames = getClassNames({});

      it('returns an empty object', () => {
        expect(classNames).to.deep.equal({});
      });
    });
    describe('such as a null object', () => {
      it('throws an error', () => {
        try {
          getClassNames(null);
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
  });
});
