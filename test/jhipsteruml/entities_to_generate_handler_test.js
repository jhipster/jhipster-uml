/* eslint-disable no-unused-expressions */
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const expect = chai.expect;
const getEntitiesToGenerate = require('../../lib/jhipsteruml/entities_to_generate_handler').getEntitiesToGenerate;
const QuestionAsker = require('../../lib/helpers/question_asker');

describe('EntitiesToGenerateHandler', () => {
  describe('#getEntitiesToGenerate', () => {
    context('when not passing a valid value', () => {
      context('as a nil value', () => {
        it('returns an empty result', () => {
          expect(getEntitiesToGenerate()).to.deep.equal([]);
        });
      });
      context('as an empty array', () => {
        it('returns an empty result', () => {
          expect(getEntitiesToGenerate([])).to.deep.equal([]);
        });
      });
    });
    context('when passing a valid list', () => {
      context('containing one entity name', () => {
        let askConfirmationStub = null;
        let result = null;

        context('when confirming', () => {
          before(() => {
            askConfirmationStub = sinon.stub(QuestionAsker, 'askConfirmation').returns(true);
            result = getEntitiesToGenerate(['Toto']);
          });
          after(() => {
            askConfirmationStub.restore();
          });

          it('asks for confirmation', () => {
            expect(askConfirmationStub).to.have.been.calledOnce;
          });
          it('returns the entity', () => {
            expect(result).to.deep.equal(['Toto']);
          });
        });
        context('when canceling', () => {
          before(() => {
            askConfirmationStub = sinon.stub(QuestionAsker, 'askConfirmation').returns(false);
            result = getEntitiesToGenerate(['Toto']);
          });
          after(() => {
            askConfirmationStub.restore();
          });

          it('asks for confirmation', () => {
            expect(askConfirmationStub).to.have.been.calledOnce;
          });
          it('returns the entity', () => {
            expect(result).to.deep.equal([]);
          });
        });
      });
      context('containing more than one entity name', () => {
        let selectMultipleChoicesStub = null;
        let result;

        before(() => {
          selectMultipleChoicesStub = sinon.stub(QuestionAsker, 'selectMultipleChoices').returns(['Toto', 'Tata']);
          result = getEntitiesToGenerate(['Toto', 'Tata']);
        });

        it('asks confirmation', () => {
          expect(selectMultipleChoicesStub).to.have.been.calledOnce;
        });
        it('returns the selected entities', () => {
          expect(result).to.deep.equal(['Toto', 'Tata']);
        });
      });
    });
  });
});
