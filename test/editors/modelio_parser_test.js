'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    ParserFactory = require('../../lib/editors/parser_factory');

describe('ModelioParser', () => {
  describe('when passing a valid diagram', () => {
    describe('taken from the HR example', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/modelio.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;
      var parsedData = parser.parse(parserData.data);

      it('parses it', () => {
        expect(parsedData).not.to.be.null;
      });
      it('correctly parses the JobHistory class', () => {
        var jobHistory = parsedData.classes['_0iCy1rieEeW4ip1mZlCqPg'];
        expect(jobHistory.name).to.eq('JobHistory');
        expect(jobHistory.tableName).to.eq('job_history');
        expect(jobHistory.fields).to.deep.eq([
          '_0iCy27ieEeW4ip1mZlCqPg',
          '_0iCy3LieEeW4ip1mZlCqPg'
        ]);
        expect(jobHistory.comment).to.eq('');
        expect(jobHistory.dto).to.eq('no');
        expect(jobHistory.pagination).to.eq('no');
        expect(jobHistory.service).to.eq('no');
      });
      it('correctly parses the Job class', () => {
        var job = parsedData.classes['_0iCy47ieEeW4ip1mZlCqPg'];
        expect(job.name).to.eq('Job');
        expect(job.tableName).to.eq('job');
        expect(job.fields).to.deep.eq([
          '_0iCy57ieEeW4ip1mZlCqPg',
          '_0iCy6LieEeW4ip1mZlCqPg',
          '_0iCy6bieEeW4ip1mZlCqPg',
          '_0iCy6rieEeW4ip1mZlCqPg'
        ]);
        expect(job.comment).to.eq('');
        expect(job.dto).to.eq('no');
        expect(job.pagination).to.eq('no');
        expect(job.service).to.eq('no');
      });
      it('correctly parses the Department class', () => {
        var department = parsedData.classes['_0iCy77ieEeW4ip1mZlCqPg'];
        expect(department.name).to.eq('Department');
        expect(department.tableName).to.eq('department');
        expect(department.fields).to.deep.eq([
          '_0iCy9LieEeW4ip1mZlCqPg',
          '_0iCy9bieEeW4ip1mZlCqPg'
        ]);
        expect(department.comment).to.eq('');
        expect(department.dto).to.eq('no');
        expect(department.pagination).to.eq('no');
        expect(department.service).to.eq('no');
      });
      it('correctly parses the Employee class', () => {
        var employee = parsedData.classes['_0iCy-7ieEeW4ip1mZlCqPg'];
        expect(employee.name).to.eq('Employee');
        expect(employee.tableName).to.eq('employee');
        expect(employee.fields).to.deep.eq([
          '_0iCzAbieEeW4ip1mZlCqPg',
          '_0iCzArieEeW4ip1mZlCqPg',
          '_0iCzA7ieEeW4ip1mZlCqPg',
          '_0iCzBLieEeW4ip1mZlCqPg',
          '_0iCzBbieEeW4ip1mZlCqPg',
          '_0iCzBrieEeW4ip1mZlCqPg',
          '_0iCzB7ieEeW4ip1mZlCqPg',
          '_0iCzCLieEeW4ip1mZlCqPg'
        ]);
        expect(employee.comment).to.eq('');
        expect(employee.dto).to.eq('no');
        expect(employee.pagination).to.eq('no');
        expect(employee.service).to.eq('no');
      });
      it('correctly parses the Location class', () => {
        var location = parsedData.classes['_0iCzELieEeW4ip1mZlCqPg'];
        expect(location.name).to.eq('Location');
        expect(location.tableName).to.eq('location');
        expect(location.fields).to.deep.eq([
          '_0iCzErieEeW4ip1mZlCqPg',
          '_0iCzE7ieEeW4ip1mZlCqPg',
          '_0iCzFLieEeW4ip1mZlCqPg',
          '_0iCzFbieEeW4ip1mZlCqPg',
          '_0iCzFrieEeW4ip1mZlCqPg'
        ]);
        expect(location.comment).to.eq('');
        expect(location.dto).to.eq('no');
        expect(location.pagination).to.eq('no');
        expect(location.service).to.eq('no');
      });
      it('correctly parses the Country class', () => {
        var country = parsedData.classes['_0iCzGbieEeW4ip1mZlCqPg'];
        expect(country.name).to.eq('Country');
        expect(country.tableName).to.eq('country');
        expect(country.fields).to.deep.eq([
          '_0iCzG7ieEeW4ip1mZlCqPg',
          '_0iCzHLieEeW4ip1mZlCqPg'
        ]);
        expect(country.comment).to.eq('');
        expect(country.dto).to.eq('no');
        expect(country.pagination).to.eq('no');
        expect(country.service).to.eq('no');
      });
      it('correctly parses the Region class', () => {
        var region = parsedData.classes['_0iCzH7ieEeW4ip1mZlCqPg'];
        expect(region.name).to.eq('Region');
        expect(region.tableName).to.eq('region');
        expect(region.fields).to.deep.eq([
          '_0iCzILieEeW4ip1mZlCqPg',
          '_0iCzIbieEeW4ip1mZlCqPg'
        ]);
        expect(region.comment).to.eq('');
        expect(region.dto).to.eq('no');
        expect(region.pagination).to.eq('no');
        expect(region.service).to.eq('no');
      });
      it('correctly parses the Task class', () => {
        var task = parsedData.classes['_0iCzIrieEeW4ip1mZlCqPg'];
        expect(task.name).to.eq('Task');
        expect(task.tableName).to.eq('task');
        expect(task.fields).to.deep.eq([
          '_0iCzI7ieEeW4ip1mZlCqPg',
          '_0iCzJLieEeW4ip1mZlCqPg',
          '_0iCzJbieEeW4ip1mZlCqPg'
        ]);
        expect(task.comment).to.eq('');
        expect(task.dto).to.eq('no');
        expect(task.pagination).to.eq('no');
        expect(task.service).to.eq('no');
      });
      it('correctly adds the class names', () => {
        expect(parsedData.classNames).to.deep.eq([
          'JobHistory',
          'Job',
          'Department',
          'Employee',
          'Location',
          'Country',
          'Region',
          'Task'
        ]);
      });
    });
    describe('with required relationships', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/modelio_required_relationships.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;
      var parsedData = parser.parse(parserData.data);

      it('sets the required flag in the AssociationData objects', () => {
        for (let i = 0, associationKeys = Object.keys(parsedData.associations); i < associationKeys.length; i++) {
          expect(
            parsedData.associations[associationKeys[i]].isInjectedFieldInFromRequired
              && parsedData.associations[associationKeys[i]].isInjectedFieldInToRequired
          ).to.be.true;
        }
      });
    });
    describe('with a lowercase type', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/modelio_lowercased_string_type.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;
      var parsedData = parser.parse(parserData.data);

      it('adds it capitalized', () => {
        expect(parsedData.types['_qlOWCZWyEeWgPqZDqm9Now'].name).to.eq('ZonedDateTime');
      });
    });
    describe('with comments', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/modelio_comments.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;
      var parsedData = parser.parse(parserData.data);

      it('parses it', () => {
        expect(parsedData).not.to.be.null;
      });
      it('adds comments in classes', () => {
        expect(parsedData.classes['_MlHMlHgFEeaD3-9XbEOL5Q'].comment).to.eq(
`<p>Description for a <strong>class:</strong></p>

<ul>
	<li><strong>one</strong></li>
	<li><strong>two</strong></li>
</ul>

<p>&nbsp;</p>`
        );
        expect(parsedData.classes['_MlHMnngFEeaD3-9XbEOL5Q'].comment).to.eq(
`<p>Another description.</p>`
        );
      });
      it('adds comments in fields', () => {
        expect(parsedData.fields['_MlHMmXgFEeaD3-9XbEOL5Q'].comment).to.eq(
`<p>Description for an <strong>attribute</strong>.</p>`
        );
      });
      it('adds comments in relationships', () => {
        expect(parsedData.associations['_MlHMm3gFEeaD3-9XbEOL5Q'].commentInFrom).to.eq(
`<p>Comment for a relationship.</p>`
        );
        expect(parsedData.associations['_MlHMm3gFEeaD3-9XbEOL5Q'].commentInTo).to.eq(
`Another comment for a relationship`
        );
      });
    });
    describe('with a user class', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/modelio_user_class_test.xmi',
        databaseType: 'sql',
        noUserManagement: true
      });
      var parser = parserData.parser;
      var parsedData = parser.parse(parserData.data);

      it('parses it', () => {
        expect(parsedData).not.to.be.null;
      });
      it('includes the user class', () => {
        expect(parsedData.classes['_66WytRBlEeW5RsvjsYghDw']).not.to.be.null;
        expect(parsedData.classNames).to.deep.eq(['User']);
      });
    });
    describe('with enums', () => {
      describe('with values', () => {
        var parserData = ParserFactory.createParser({
          file: './test/xmi/modelio_enum_test.xmi',
          databaseType: 'sql',
          noUserManagement: true
        });
        var parser = parserData.parser;
        var parsedData = parser.parse(parserData.data);

        it('parses it', () => {
          expect(parsedData).not.to.be.null;
        });
        it('adds the enum and the values', () => {
          expect(parsedData.enums['_LwhPWSFnEeWP5-PV_D3nAw']).not.to.be.null;
          expect(parsedData.enums['_LwhPWSFnEeWP5-PV_D3nAw'].name).to.eq('MyEnumeration');
          expect(
            parsedData.enums['_LwhPWSFnEeWP5-PV_D3nAw'].values
          ).to.deep.eq(['VALUE_A', 'VALUE_B']);
          expect(parsedData.enums['_LwhPXCFnEeWP5-PV_D3nAw']).not.to.be.null;
          expect(parsedData.enums['_LwhPXCFnEeWP5-PV_D3nAw'].name).to.eq('MySecondEnumeration');
          expect(parsedData.enums['_LwhPXCFnEeWP5-PV_D3nAw'].values).to.deep.eq(['VALUE_A']);
        });
        it('uses the enums as types for fields', () => {
          expect(parsedData.fields['_LwhPViFnEeWP5-PV_D3nAw'].type).to.eq('_LwhPWSFnEeWP5-PV_D3nAw');
          expect(parsedData.fields['_LwhPVyFnEeWP5-PV_D3nAw'].type).to.eq('_LwhPXCFnEeWP5-PV_D3nAw');
          expect(parsedData.fields['_LwhPWCFnEeWP5-PV_D3nAw'].type).to.eq('_LwhPWSFnEeWP5-PV_D3nAw');
        });
      });
      describe('without values', () => {
        var parserData = ParserFactory.createParser({
          file: './test/xmi/modelio_enum_no_value_test.xmi',
          databaseType: 'sql',
          noUserManagement: true
        });
        var parser = parserData.parser;
        var parsedData = parser.parse(parserData.data);

        it('parses it', () => {
          expect(parsedData).not.to.be.null;
        });
        it('still adds the enum', () => {
          expect(parsedData.enums['_LwhPWSFnEeWP5-PV_D3nAw']).not.to.be.null;
        });
      });
    });
    describe('with packages', () => {
      describe('simple model', () => {
        var parserData = ParserFactory.createParser({
          file: './test/xmi/modelio_packages.xmi',
          databaseType: 'sql'
        });
        var parser = parserData.parser;
        var parsedData = parser.parse(parserData.data);

        it('parses it', () => {
          expect(parsedData).not.to.be.null;
        });
        it('works by adding all the classes', () => {
          expect(parsedData.classNames).to.deep.eq(['Class1', 'Class3', 'Class2']);
          expect(parsedData.classes['_vC4sxHdfEeaWkfx80xqrTw']).not.to.be.null;
          expect(parsedData.classes['_vC4syndfEeaWkfx80xqrTw']).not.to.be.null;
          expect(parsedData.classes['_vC4sz3dfEeaWkfx80xqrTw']).not.to.be.null;
          expect(parsedData.associations['_vC4sx3dfEeaWkfx80xqrTw']).not.to.be.null;
          expect(parsedData.associations['_vC4szXdfEeaWkfx80xqrTw']).not.to.be.null;

        });
      });
      describe('more complex model', () => {
        var parserData = ParserFactory.createParser({
          file: './test/xmi/modelio_packages2.xmi',
          databaseType: 'sql'
        });
        var parser = parserData.parser;
        var parsedData = parser.parse(parserData.data);

        it('parses it', () => {
          expect(parsedData).not.to.be.null;
        });
        it('works by adding all the classes', () => {
          expect(parsedData.classNames).to.deep.eq(['Class1', 'Class3', 'Class2']);
          expect(parsedData.classes['_bYuIdaFSEeaVvapPODu8lg']).not.to.be.null;
          expect(parsedData.classes['_bYuviqFSEeaVvapPODu8lg']).not.to.be.null;
          expect(parsedData.classes['_bYuvj6FSEeaVvapPODu8lg']).not.to.be.null;
          expect(parsedData.enums['_bYuvi6FSEeaVvapPODu8lg']).not.to.be.null;
          expect(parsedData.associations['_bYuvhaFSEeaVvapPODu8lg']).not.to.be.null;
          expect(parsedData.associations['_bYuvg6FSEeaVvapPODu8lg']).not.to.be.null;
          expect(parsedData.associations['_bYuvh6FSEeaVvapPODu8lg']).not.to.be.null;

        });
      });
    });
  });
  describe('when passing an invalid diagram', () => {
    describe('as a class has no name', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/modelio_no_class_name_test.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;

      it('fails', () => {
        try {
          parser.parse(parserData.data);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('as a field has no name', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/modelio_no_attribute_name_test.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;

      it('fails', () => {
        try {
          parser.parse(parserData.data);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('as a validation has no name', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/modelio_no_validation_name_test.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;

      it('fails', () => {
        try {
          parser.parse(parserData.data);
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongValidationException');
        }
      });
    });
    describe("as an enum's value as no name", () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/modelio_enum_no_attribute_name_test.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;

      it('fails', () => {
        try {
          parser.parse(parserData.data);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('as an enum has no name', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/modelio_enum_no_name_test.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;

      it('fails', () => {
        try {
          parser.parse(parserData.data);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('as a class name is a reserved word', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/modelio_reserved_class_name_test.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;

      it('fails', () => {
        try {
          parser.parse(parserData.data);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalNameException');
        }
      });
    });
    describe('as a field name is a reserved word', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/modelio_reserved_field_name_test.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;

      it('fails', () => {
        try {
          parser.parse(parserData.data);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalNameException');
        }
      });
    });
    describe('as a table name is a reserved word', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/modelio_reserved_table_name_test.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;

      it('fails', () => {
        try {
          parser.parse(parserData.data);
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalNameException');
        }
      });
    });
    describe('as an invalid type is used', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/modelio_wrong_typename.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;

      it('fails', () => {
        try {
          parser.parse(parserData.data);
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongTypeException');
        }
      });
    });
  });
});
