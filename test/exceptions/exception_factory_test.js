'use strict';

const expect = require('chai').expect,
  buildException = require('../../lib/exceptions/exception_factory').buildException;

describe('ExceptionFactory', () => {
  describe('#buildException', () => {
    const exception = buildException('Working', null);

    it("adds the 'Exception' suffix to the names", () => {
      expect(exception.name).to.eq('WorkingException');
    });
    it('builds throwable objects', () => {
      try {
        throw new buildException('Working', null);
      } catch (error) {
        expect(error.name).to.eq('WorkingException');
      }
    });
    describe('when only passing a name', () => {
      const exception1 = buildException('Working', null);
      const exception2 = buildException('Working', '');

      it('takes the name and adds no message', () => {
        expect(exception1.name).to.eq('WorkingException');
        expect(exception1.message).to.be.empty;
        expect(exception2.name).to.eq('WorkingException');
        expect(exception2.message).to.be.empty;
      });
    });
    describe('when only passing a message', () => {
      const exception1 = buildException(null, 'The message');
      const exception2 = buildException('', 'The message');

      it('just adds the suffix and keeps the message', () => {
        expect(exception1.name).to.eq('Exception');
        expect(exception1.message).to.eq('The message');
        expect(exception2.name).to.eq('Exception');
        expect(exception2.message).to.eq('The message');
      });
    });
    describe('when passing in a name and a message', () => {
      const exception = buildException('Good', 'The message');

      it('keeps both', () => {
        expect(exception.name).to.eq('GoodException');
        expect(exception.message).to.eq('The message');
      });
    });
    describe('when not passing anything', () => {
      const exception = buildException(null, null);

      it("names the exception 'Exception' and puts no message", () => {
        expect(exception.name).to.eq('Exception');
        expect(exception.message).to.be.empty;
      });
    });
  });
});
