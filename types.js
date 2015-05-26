'use strict';

var base = require('selfish').Base; // for inheritance

/**
 * This interface provides base methods for handling the types.
 */
var Types = base.extend({
    
    /**
     * Must be implemented by subclasses.
     * Returns the type list.
     * @return {array} the type list.
     * @throws UnimplementedOperationException if the method has not been
     *                                         implemented by the subclass.
     */
    getTypes: function() {
      throw new UnimplementedOperationException(
        'This method must be implemented by a subclass to be called.');
    },

    /**
     * Must be implemented by subclasses.
     * Returns the validations for the passed type.
     * @return {array} the validation list.
     * @throws UnimplementedOperationException if the method has not been
     *                                         implemented by the subclass.
     * @throws NoElementFoundException if no type exists for the passed type. 
     */
    getValidationsForType: function(type) {
      throw new UnimplementedOperationException(
        'This method must be implemented by a subclass to be called.');
    },

    /**
     * This method converts the internal type map into another array.
     * Each element is an Object which has a name, and a value.
     * By default, the name and the value keys have the same value:
     * [ { name: '1', value: '1' }, { name: '2', value: '2' }, ... ]
     * @return {array} the new array.
     */
    toValueNameObjectArray: function() {
      var array = [];
      for (var key in this.getTypes()) {
        var object = {};
        object['value'] = this.getTypes()[key];
        object['name'] = this.getTypes()[key];            
        array.push(object);
      }
      return array;
    },

    /**
     * Checks whether the type is contained in the supported types.
     * @param {string} type the type to check.
     * @return {boolean} whether the type is contained in the supported types.
     */
    contains: function(type) {
      return this.getTypes().indexOf(type) != -1;
    },

    /**
     * Checks whether the type possesses the also passed validation.
     * @param type {string} the type.
     * @param validation {string} the validation to check.
     * @return {boolean} whether the type is validated by the validation.
     * @throws NoElementFoundException if no type exists for the passed type.
     */
    isValidationSupportedForType: function(type, validation) {
      return this.getValidationsForType(type).indexOf(validation) != -1;
    }
});

var AbstractMappedTypes = Types.extend({

    /**
     * Method implementation from Type.
     */
    getTypes: function() {
      return Object.keys(this.types);
    },

    /**
     * Method implementation from Type.
     */
    getValidationsForType: function(type) {
      if (!this.contains(type)) {
        throw new NoElementFoundException(
          "The passed type: '" 
          + type 
          + "' is not a supported supported types.");
      }
      return this.types[type];
    }
});

/**
 * This class extends the Types interface to provide the SQL types supported
 * by JHipster (for MySQL, PostgreSQL, H2).
 */
exports.SQLTypes = AbstractMappedTypes.extend({

  /**
   * Default constructor.
   */
  initialize: function() {
    // this.types = [ 'String', 'Integer', 'Long', 'BigDecimal', 'LocalDate', 'DateTime', 'Boolean' ];
    this.types = {
      'String': [ 'required', 'minlength', 'maxlength', 'pattern' ],
      'Integer': [ 'required', 'min', 'max' ],
      'Long': [ 'required', 'min', 'max' ],
      'BigDecimal': [ 'required', 'min', 'max' ],
      'LocalDate' : [ 'required' ],
      'DateTime' : [ 'required' ],
      'Boolean' : []
    };
  }
});

/**
 * This class extends the Types interface to provide the MongoDB types
 * supported by JHipster.
 */

exports.MongoDBTypes = AbstractMappedTypes.extend({

  /**
   * Default constructor.
   */
  initialize: function() {
    // this.types = [ 'String', 'Integer', 'Long', 'BigDecimal', 'LocalDate', 'DateTime', 'Boolean' ];
    this.types = {
      'String': [ 'required', 'minlength', 'maxlength', 'pattern' ],
      'Integer': [ 'required', 'min', 'max' ],
      'Long': [ 'required', 'min', 'max' ],
      'BigDecimal': [ 'required', 'min', 'max' ],
      'LocalDate' : [ 'required' ],
      'DateTime' : [ 'required' ],
      'Boolean' : []
    };
  }
});

/**
 * This class extends the Types interface to provide the Cassandra types
 * supported by JHipster.
 */
exports.CassandraTypes = AbstractMappedTypes.extend({

  /**
   * Default constructor.
   */
  initialize: function() {
    // this.types = [ 'UUID', 'TimeUUID', 'String', 'Integer', 'Long', 'BigDecimal', 'Date', 'Boolean' ];
    this.types = {
      'UUID': [ 'required' ],
      'TimeUUID': [ 'required' ],
      'String': [ 'required', 'minlength', 'maxlength', 'pattern' ],
      'Integer': [ 'required', 'min', 'max' ],
      'Long' : [ 'required', 'min', 'max' ],
      'BigDecimal' : [ 'required', 'min', 'max' ],
      'Date' : [],
      'Boolean' : [],
    };
  }
});

function NoElementFoundException(message) {
  this.name = 'NoElementFoundException';
  this.message = (message || '');
}
NoElementFoundException.prototype = new Error();

function UnimplementedOperationException(message) {
  this.name = 'UnimplementedOperationException';
  this.message = (message || '');
}
UnimplementedOperationException.prototype = new Error();