/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;
const BuildException = require('../../lib/exceptions/exception_factory').BuildException;

describe('ExceptionFactory', () => {
  describe('#BuildException', () => {
    const exception = BuildException('Working', null);

    it('adds the \'Exception\' suffix to the names', () => {
      expect(exception.name).to.eq('WorkingException');
    });
    it('builds throwable objects', () => {
      try {
        throw new BuildException('Working', null);
      } catch (error) {
        expect(error.name).to.eq('WorkingException');
      }
    });
    describe('when only passing a name', () => {
      const exception1 = BuildException('Working', null);
      const exception2 = BuildException('Working', '');

      it('takes the name and adds no message', () => {
        expect(exception1.name).to.eq('WorkingException');
        expect(exception1.message).to.be.empty;
        expect(exception2.name).to.eq('WorkingException');
        expect(exception2.message).to.be.empty;
      });
    });
    describe('when only passing a message', () => {
      const exception1 = BuildException(null, 'The message');
      const exception2 = BuildException('', 'The message');

      it('just adds the suffix and keeps the message', () => {
        expect(exception1.name).to.eq('Exception');
        expect(exception1.message).to.eq('The message');
        expect(exception2.name).to.eq('Exception');
        expect(exception2.message).to.eq('The message');
      });
    });
    describe('when passing in a name and a message', () => {
      const exception = BuildException('Good', 'The message');

      it('keeps both', () => {
        expect(exception.name).to.eq('GoodException');
        expect(exception.message).to.eq('The message');
      });
    });
    describe('when not passing anything', () => {
      const exception = BuildException(null, null);

      it('names the exception \'Exception\' and puts no message', () => {
        expect(exception.name).to.eq('Exception');
        expect(exception.message).to.be.empty;
      });
    });
  });
});
