'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    ParserFactory = require('../../lib/editors/parser_factory');


describe('GenMyModelParser', () => {
  describe('when passing a valid diagram', () => {
    describe('taken from the HR example', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/genmymodel.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;
      var parsedData = parser.parse(parserData.data);

      it('parses it', () => {
        expect(parsedData).not.to.be.null;
      });
      it('correctly parses the JobHistory class', () => {
        var jobHistory = parsedData.classes['_rasqOrvHEeWM0I0nquuJQA'];
        expect(jobHistory.name).to.eq('JobHistory');
        expect(jobHistory.tableName).to.eq('job_history');
        expect(jobHistory.fields).to.deep.eq([
          '_rasqPbvHEeWM0I0nquuJQA',
          '_rasqQLvHEeWM0I0nquuJQA'
        ]);
        expect(jobHistory.comment).to.eq('');
        expect(jobHistory.dto).to.eq('no');
        expect(jobHistory.pagination).to.eq('no');
        expect(jobHistory.service).to.eq('no');
      });
      it('correctly parses the Job class', () => {
        var job = parsedData.classes['_rasqXLvHEeWM0I0nquuJQA'];
        expect(job.name).to.eq('Job');
        expect(job.tableName).to.eq('job');
        expect(job.fields).to.deep.eq([
          '_rasqX7vHEeWM0I0nquuJQA',
          '_rasqYrvHEeWM0I0nquuJQA',
          '_rasqZbvHEeWM0I0nquuJQA',
          '_rasqaLvHEeWM0I0nquuJQA'
        ]);
        expect(job.comment).to.eq('');
        expect(job.dto).to.eq('no');
        expect(job.pagination).to.eq('no');
        expect(job.service).to.eq('no');
      });
      it('correctly parses the Department class', () => {
        var department = parsedData.classes['_rasqRrvHEeWM0I0nquuJQA'];
        expect(department.name).to.eq('Department');
        expect(department.tableName).to.eq('department');
        expect(department.fields).to.deep.eq([
          '_rasqSbvHEeWM0I0nquuJQA',
          '_rasqTLvHEeWM0I0nquuJQA'
        ]);
        expect(department.comment).to.eq('');
        expect(department.dto).to.eq('no');
        expect(department.pagination).to.eq('no');
        expect(department.service).to.eq('no');
      });
      it('correctly parses the Employee class', () => {
        var employee = parsedData.classes['_ratRVLvHEeWM0I0nquuJQA'];
        expect(employee.name).to.eq('Employee');
        expect(employee.tableName).to.eq('employee');
        expect(employee.fields).to.deep.eq([
          '_ratRV7vHEeWM0I0nquuJQA',
          '_ratRWrvHEeWM0I0nquuJQA',
          '_ratRXbvHEeWM0I0nquuJQA',
          '_ratRYLvHEeWM0I0nquuJQA',
          '_ratRY7vHEeWM0I0nquuJQA',
          '_ratRZrvHEeWM0I0nquuJQA',
          '_ratRabvHEeWM0I0nquuJQA',
          '_ratRbLvHEeWM0I0nquuJQA'
        ]);
        expect(employee.comment).to.eq('');
        expect(employee.dto).to.eq('no');
        expect(employee.pagination).to.eq('no');
        expect(employee.service).to.eq('no');
      });
      it('correctly parses the Location class', () => {
        var location = parsedData.classes['_ratRo7vHEeWM0I0nquuJQA'];
        expect(location.name).to.eq('Location');
        expect(location.tableName).to.eq('location');
        expect(location.fields).to.deep.eq([
          '_ratRprvHEeWM0I0nquuJQA',
          '_ratRqbvHEeWM0I0nquuJQA',
          '_ratRrLvHEeWM0I0nquuJQA',
          '_ratRr7vHEeWM0I0nquuJQA',
          '_ratRsrvHEeWM0I0nquuJQA'
        ]);
        expect(location.comment).to.eq('');
        expect(location.dto).to.eq('no');
        expect(location.pagination).to.eq('no');
        expect(location.service).to.eq('no');
      });
      it('correctly parses the Country class', () => {
        var country = parsedData.classes['_ratRwrvHEeWM0I0nquuJQA'];
        expect(country.name).to.eq('Country');
        expect(country.tableName).to.eq('country');
        expect(country.fields).to.deep.eq([
          '_ratRxbvHEeWM0I0nquuJQA',
          '_ratRyLvHEeWM0I0nquuJQA'
        ]);
        expect(country.comment).to.eq('');
        expect(country.dto).to.eq('no');
        expect(country.pagination).to.eq('no');
        expect(country.service).to.eq('no');
      });
      it('correctly parses the Region class', () => {
        var region = parsedData.classes['_ratR2LvHEeWM0I0nquuJQA'];
        expect(region.name).to.eq('Region');
        expect(region.tableName).to.eq('region');
        expect(region.fields).to.deep.eq([
          '_ratR27vHEeWM0I0nquuJQA',
          '_ratR3rvHEeWM0I0nquuJQA'
        ]);
        expect(region.comment).to.eq('');
        expect(region.dto).to.eq('no');
        expect(region.pagination).to.eq('no');
        expect(region.service).to.eq('no');
      });
      it('correctly parses the Task class', () => {
        var task = parsedData.classes['_rasqe7vHEeWM0I0nquuJQA'];
        expect(task.name).to.eq('Task');
        expect(task.tableName).to.eq('task');
        expect(task.fields).to.deep.eq([
          '_rasqfrvHEeWM0I0nquuJQA',
          '_rasqgbvHEeWM0I0nquuJQA',
          '_ratRQbvHEeWM0I0nquuJQA'
        ]);
        expect(task.comment).to.eq('');
        expect(task.dto).to.eq('no');
        expect(task.pagination).to.eq('no');
        expect(task.service).to.eq('no');
      });
      it('correctly adds the class names', () => {
        expect(parsedData.classNames).to.deep.eq([
          'JobHistory',
          'Department',
          'Job',
          'Task',
          'Employee',
          'Location',
          'Country',
          'Region'
        ]);
      });
    });
    describe('with required relationships', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/genmymodel_required_relationships.xmi',
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
        file: './test/xmi/genmymodel_lowercased_string_type.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;
      var parsedData = parser.parse(parserData.data);

      it('adds it capitalized', () => {
        expect(parsedData.types['String'].name).to.eq('String');
      });
    });
    describe('with comments', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/genmymodel_comments.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;
      var parsedData = parser.parse(parserData.data);

      it('parses it', () => {
        expect(parsedData).not.to.be.null;
      });
      it('adds comments in classes', () => {
        expect(parsedData.classes['_UlHVuVFwEeW5wfYDi5CV9g'].comment).to.eq(
`This is a class <b>comment</b>!<br>`
        );
        expect(parsedData.classes['_UlHVwVFwEeW5wfYDi5CV9g'].comment).to.eq(
`Something.`
        );
      });
      it('adds comments in fields', () => {
        expect(parsedData.fields['_UlHVvVFwEeW5wfYDi5CV9g'].comment).to.eq(
`This is an attribute <i>comment</i>.<br>`
        );
      });
      it('adds comments in relationships', () => {
        expect(parsedData.associations['_UlHVxVFwEeW5wfYDi5CV9g'].commentInFrom).to.eq(
`This is yet another comment!<br><br>Weird...<br>`
        );
        expect(parsedData.associations['_UlHVxVFwEeW5wfYDi5CV9g'].commentInTo).to.eq(
`This is a relationship comment.<br>`
        );
      });
    });
    describe('with a user class', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/genmymodel_user_class_test.xmi',
        databaseType: 'sql',
        noUserManagement: true
      });
      var parser = parserData.parser;
      var parsedData = parser.parse(parserData.data);

      it('parses it', () => {
        expect(parsedData).not.to.be.null;
      });
      it('includes the user class', () => {
        expect(parsedData.classes['_YzPHjORNEeSNGZq_xSbn1w']).not.to.be.null;
        expect(parsedData.classNames).to.deep.eq(['User']);
      });
    });
    describe('with enums', () => {
      describe('with values', () => {
        var parserData = ParserFactory.createParser({
          file: './test/xmi/genmymodel_enum_test.xmi',
          databaseType: 'sql',
          noUserManagement: true
        });
        var parser = parserData.parser;
        var parsedData = parser.parse(parserData.data);

        it('parses it', () => {
          expect(parsedData).not.to.be.null;
        });
        it('adds the enum and the values', () => {
          expect(parsedData.enums['_fxHe2CGGEeW9keBtFZy97Q']).not.to.be.null;
          expect(parsedData.enums['_fxHe2CGGEeW9keBtFZy97Q'].name).to.eq('MyEnumeration');
          expect(
            parsedData.enums['_fxHe2CGGEeW9keBtFZy97Q'].values
          ).to.deep.eq(['LITERAL1', 'LITERAL2']);
          expect(parsedData.enums['_fxHe4SGGEeW9keBtFZy97Q']).not.to.be.null;
          expect(parsedData.enums['_fxHe4SGGEeW9keBtFZy97Q'].name).to.eq('MyEnumeration2');
          expect(parsedData.enums['_fxHe4SGGEeW9keBtFZy97Q'].values).to.deep.eq(['LITERAL']);
        });
        it('uses the enums as types for fields', () => {
          expect(parsedData.fields['_fxHezyGGEeW9keBtFZy97Q'].type).to.eq('_fxHe2CGGEeW9keBtFZy97Q');
          expect(parsedData.fields['_fxHe0iGGEeW9keBtFZy97Q'].type).to.eq('_fxHe4SGGEeW9keBtFZy97Q');
          expect(parsedData.fields['_fxHe1SGGEeW9keBtFZy97Q'].type).to.eq('_fxHe2CGGEeW9keBtFZy97Q');
        });
      });
      describe('without values', () => {
        var parserData = ParserFactory.createParser({
          file: './test/xmi/genmymodel_enum_no_value_test.xmi',
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
    describe('with package', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/genmymodel_package.xmi',
        databaseType: 'sql'
      });
      var parser = parserData.parser;
      var parsedData = parser.parse(parserData.data);

      it('parses it', () => {
        expect(parsedData).not.to.be.null;
      });
      it('includes classes in package', () => {
        expect(parsedData.classes['_z3DqLaFTEeawbN_F_HFDxg']).not.to.be.null;
        expect(parsedData.classes['_z3DqQ6FTEeawbN_F_HFDxg']).not.to.be.null;
        expect(parsedData.classNames).to.deep.eq(['A','B']);
        expect(parsedData.enums['_z3DqRqFTEeawbN_F_HFDxg']).not.to.be.null;
        expect(parsedData.associations['_z3DqM6FTEeawbN_F_HFDxg']).not.to.be.null;
      });
    });
  });
  describe('when passing an invalid diagram', () => {
    describe('as a class has no name', () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/genmymodel_no_class_name_test.xmi',
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
        file: './test/xmi/genmymodel_no_attribute_name_test.xmi',
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
    describe("as an enum's value as no name", () => {
      var parserData = ParserFactory.createParser({
        file: './test/xmi/genmymodel_enum_no_attribute_name_test.xmi',
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
        file: './test/xmi/genmymodel_enum_no_name_test.xmi',
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
        file: './test/xmi/genmymodel_reserved_class_name_test.xmi',
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
        file: './test/xmi/genmymodel_reserved_field_name_test.xmi',
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
        file: './test/xmi/genmymodel_reserved_table_name_test.xmi',
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
        file: './test/xmi/genmymodel_wrong_type.xmi',
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
