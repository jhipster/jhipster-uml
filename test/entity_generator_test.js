/* eslint-disable no-unused-expressions */
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const childProcess = require('child_process');

const generateEntities = require('../lib/entity_generator').generateEntities;

chai.use(sinonChai);
const expect = chai.expect;

describe('EntityGenerator', () => {
  describe('::generateEntities', () => {
    context('when trying to generate with empty parameters', () => {
      context('such as empty entities to generate', () => {
        it('doesn\'t throw any error', () => {
          expect(generateEntities([], { toto: { name: 'toto' } }, ['toto']));
        });
      });
      context('such as empty classes', () => {
        it('doesn\'t throw any error', () => {
          expect(generateEntities(['toto'], {}, ['toto']));
        });
      });
      context('such as empty entity names to generate', () => {
        it('doesn\'t throw any error', () => {
          expect(generateEntities(['toto'], { toto: { name: 'toto' } }, []));
        });
      });
    });
    context('when generating with regular parameters', () => {
      let spawnSyncStub = null;

      before(() => {
        spawnSyncStub = sinon.stub(childProcess, 'spawnSync').returns(null);
        generateEntities(
          ['toto', 'titi'],
          { toto: { name: 'toto' }, titi: { name: 'titi' } },
          ['toto', 'titi'],
          {
            force: true,
            listOfNoClient: ['titi'],
            listOfNoServer: ['toto'],
            fluentMethods: ['titi', 'toto'],
            angularSuffixes: { titi: 'titiSuffix' },
            noUserManagement: true
          });
      });
      after(() => {
        spawnSyncStub.restore();
      });

      it('uses twice the subgen', () => {
        expect(spawnSyncStub).to.have.been.calledTwice;
      });
      it('calls the subgen with the specific options', () => {
        expect(
          `${spawnSyncStub.getCall(0).args[0]} ${spawnSyncStub.getCall(0).args[1].join(' ')}`
        ).to.equal('yo jhipster:entity toto --force --skip-server --no-fluent-methods --skip-user-management --skip-install --regenerate');
        expect(
          `${spawnSyncStub.getCall(1).args[0]} ${spawnSyncStub.getCall(1).args[1].join(' ')}`
        ).to.equal('yo jhipster:entity titi --force --skip-client --no-fluent-methods --angular-suffix titiSuffix --skip-user-management --regenerate');
      });
    });
  });
});

