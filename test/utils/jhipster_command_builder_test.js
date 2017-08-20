const JHipsterCommandBuilder = require('../../lib/utils/jhipster_command_builder');
const expect = require('chai').expect;

const fail = expect.fail;

describe('JHipsterCommandBuilder', () => {
  let builder = null;
  let built = null;
  const className = 'abc';

  beforeEach(() => {
    builder = new JHipsterCommandBuilder();
  });

  describe('#force', () => {
    it('adds the --force option', () => {
      builder.force();
      expect(builder.args.indexOf('--force')).not.to.eq(-1);
    });
  });
  describe('#className', () => {
    describe('when passing a valid class name', () => {
      it('adds it', () => {
        builder.className(className);
        expect(builder.build().args.indexOf(className)).not.to.eq(-1);
      });
    });
    describe('when passing an invalid value', () => {
      it('fails', () => {
        try {
          builder.className();
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
        try {
          builder.className('');
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
  });
  describe('#skipClient', () => {
    it('adds the --skip-client flag', () => {
      builder.skipClient();
      expect(builder.args.indexOf('--skip-client')).not.to.eq(-1);
    });
  });
  describe('#skipServer', () => {
    it('adds the --skip-server flag', () => {
      builder.skipServer();
      expect(builder.args.indexOf('--skip-server')).not.to.eq(-1);
    });
  });
  describe('#noFluentMethods', () => {
    it('adds the --no-fluent-methods flag', () => {
      builder.noFluentMethods();
      expect(builder.args.indexOf('--no-fluent-methods')).not.to.eq(-1);
    });
  });
  describe('#angularSuffix', () => {
    it('adds the --angular-suffix flag followed by the suffix', () => {
      builder.angularSuffix('suffix');
      const index = builder.args.indexOf('--angular-suffix');
      expect(index).not.to.eq(-1);
      expect(builder.args[index + 1]).to.eq('suffix');
    });
  });
  describe('#skipUserManagement', () => {
    it('adds the --skip-user-management flag', () => {
      builder.skipUserManagement();
      expect(builder.args.indexOf('--skip-user-management')).not.to.eq(-1);
    });
  });
  describe('#skipInstall', () => {
    it('adds the --skip-install flag', () => {
      builder.skipInstall();
      expect(builder.args.indexOf('--skip-install')).not.to.eq(-1);
    });
  });
  describe('#build', () => {
    describe('if there is no class name', () => {
      it('fails', () => {
        try {
          builder.build();
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalStateException');
        }
      });
    });
    describe('if a class name has been given', () => {
      beforeEach(() => {
        built = builder.className(className).build();
      });

      it('builds the command from the actual platform', () => {
        if (process.platform === 'win32') {
          if (process.env.comspec) {
            expect(built.command).to.eq(process.env.comspec);
          } else {
            expect(built.command).to.eq('cmd.exe');
          }
        } else {
          expect(built.command).to.eq('yo');
        }
      });
      it('builds the args array from the actual platform and adds the --regenerate flag', () => {
        built = builder
          .force()
          .skipClient()
          .skipServer()
          .skipInstall()
          .angularSuffix('suffix')
          .skipUserManagement()
          .build();
        if (process.platform === 'win32') {
          expect(built.args).to.deep.eq([
            '/s',
            '/c',
            'yo jhipster:entity',
            className,
            '--force',
            '--skip-client',
            '--skip-server',
            '--skip-install',
            '--angular-suffix',
            'suffix',
            '--skip-user-management',
            '--regenerate']);
        } else {
          expect(built.args).to.deep.eq([
            'jhipster:entity',
            className,
            '--force',
            '--skip-client',
            '--skip-server',
            '--skip-install',
            '--angular-suffix',
            'suffix',
            '--skip-user-management',
            '--regenerate']);
        }
      });
      it('builds the stdio array', () => {
        expect(built.stdio).to.deep.eq([process.stdin, process.stdout, process.stderr]);
      });
    });
  });
});
