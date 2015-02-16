'use strict';

var _ = require('lodash')
var U = require('./utils')
var T = require('../lib/transform')

module.exports = {
	/**
	 * Returns a ActionSchemaTest which should check for a required parameter error.
	 */
	missingRequired: function(IOD, paramName, path, action) {
		return {
			name: 'missing required parameter ' + paramName,
			IODOpts: {
				action: T.attempt(U.paths[path], action)(IOD),
				params: {
					text: 'some text',
					url: 'some url',
					json: 'some json'
				},
				files: ['some file']
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'required', paramName)
			]
		}
	},
	/**
	 * Returns a ActionSchemaTest which should check for a no required inputs error.
	 */
	noInputs: function(IOD, path, action) {
		return {
			name: 'no inputs',
			IODOpts: {
				action: T.attempt(U.paths[path], action)(IOD),
				params: {}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInError, 'inputs')
			]
		}
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid string type error.
	 */
	invalidStringType: function(IOD, paramName, path, action) {
		return {
			name: 'invalid string for ' + paramName,
			IODOpts: {
				action: T.attempt(U.paths[path], action)(IOD),
				params: T.maplet(paramName)([1, 2, 3])
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', paramName)
			]
		}
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid object type error.
	 */
	invalidObjType: function(IOD, paramName, path, action) {
		return {
			name: 'invalid object for ' + paramName,
			IODOpts: {
				action: T.attempt(U.paths[path], action)(IOD),
				params: T.maplet(paramName)('not an object')
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', paramName)
			]
		}
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid enum value error.
	 */
	invalidEnumValue: function(IOD, paramName, path, action) {
		return {
			name: 'invalid enum for ' + paramName,
			IODOpts: {
				action: T.attempt(U.paths[path], action)(IOD),
				params: T.maplet(paramName)('invalid enum')
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'enum', paramName)
			]
		}
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid bollean type error.
	 */
	invalidBooleanType: function(IOD, paramName, path, action) {
		return {
			name: 'invalid boolean for ' + paramName,
			IODOpts: {
				action: T.attempt(U.paths[path], action)(IOD),
				params: T.maplet(paramName)('invalid boolean')
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', paramName)
			]
		}
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid number type error.
	 */
	invalidNumberType: function(IOD, paramName, path, action) {
		return {
			name: 'invalid number for ' + paramName,
			IODOpts: {
				action: T.attempt(U.paths[path], action)(IOD),
				params: T.maplet(paramName)('invalid number')
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', paramName)
			]
		}
	},
	/**
	 * Returns a ActionSchemaTest which should check for a below minimum error.
	 */
	invalidMinimum: function(IOD, paramName, min, path, action) {
		return {
			name: min + ' for ' + paramName,
			IODOpts: {
				action: T.attempt(U.paths[path], action)(IOD),
				params: T.maplet(paramName)(min)
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'minimum', paramName)
			]
		}
	},
	/**
	 * Returns a ActionSchemaTest which should check for a above maximum error.
	 */
	invalidMiximum: function(IOD, paramName, max, path, action) {
		return {
			name: max + ' for ' + paramName,
			IODOpts: {
				action: T.attempt(U.paths[path], action)(IOD),
				params: T.maplet(paramName)(max)
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'maximum', paramName)
			]
		}
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid array string type error.
	 */
	invalidArrayString: function(IOD, paramName, path, action) {
		return {
			name: 'invalid array for ' + paramName,
			IODOpts: {
				action: T.attempt(U.paths[path], action)(IOD),
				params: T.maplet(paramName)({ key: 'not array of strings' })
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', paramName)
			]
		}
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid array object type error.
	 */
	invalidArrayObj: function(IOD, paramName, path, action) {
		return {
			name: 'invalid array for ' + paramName,
			IODOpts: {
				action: T.attempt(U.paths[path], action)(IOD),
				params: T.maplet(paramName)('not array of objects')
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', paramName)
			]
		}
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid pairs between file
	 * and additional_metadata.
	 */
	uneqlFileAddMeta: function(IOD, filePath, path, action) {
		return {
			name: 'unequal pair length file-additional_metadata',
			IODOpts: {
				action: T.attempt(U.paths[path], action)(IOD),
				params: {
					additional_metadata: [
						{ addMeta: 'addMeta' },
						{ addMeta: 'addMeta' }
					]
				},
				files: [filePath, filePath, filePath]
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInError, 'pairs')
			]
		}
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid pairs between file
	 * and reference_prefix.
	 */
	uneqlFileRefPref: function(IOD, filePath, path, action, required) {
		return {
			name: 'unequal pair length file-reference_prefix',
			IODOpts: {
				action: T.attempt(U.paths[path], action)(IOD),
				params: _.defaults(required || {}, {
					reference_prefix: ['prefix', 'prefix']
				}),
				files: [filePath, filePath, filePath]
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInError, 'pairs')
			]
		}
	}
}

/**
 * Wraps all common action schema tests.
 * Defaults a required object parameter `required` to the parameter of IODOpts, so that
 * schema check won't fail on required parameters.
 *
 * @param {Object} required - Required parameters object
 * @returns {Object} - Action schema test
 */
// TODO: make this chainable
// TODO: use curry instead of partials
module.exports.withRequired = function(required) {
	return _.mapValues(module.exports, function(schemaTest) {
		return function() {
			var args = [].slice.call(arguments)
			var test = schemaTest.apply(null, args)
			test.IODOpts.params = _.defaults({}, required, test.IODOpts.params)

			return test
		}
	})
}

/**
 * Wraps all common action schema tests.
 * Prepends `prepend` to the test name of all tests.
 *
 * @param {String} prepend - String to prepend
 * @returns {Object} - Action schema test
 */
module.exports.withPrepend = function(prepend) {
	return _.mapValues(module.exports, function(schemaTest) {
		return function() {
			var args = [].slice.call(arguments)
			var test = schemaTest.apply(null, args)
			test.name = prepend + ' ' + test.name

			return test
		}
	})
}