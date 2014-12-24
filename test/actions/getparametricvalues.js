/**
 * Test data for getparametricvalues action.
 */

'use strict';

var U = require('../utils')
var ASTests = require('../action-schema-tests-utils')

var _ = require('lodash')
var should = require('should')
var T = require('../../lib/transform')

var action = 'getparametricvalues'

/**
 * Specific type of action.
 */
exports.type = 'api'

/**
 * Returns list of schema tests for action.
 * Schema Tests consist of: {
 * 	{String} name - Name of test,
 * 	{Object} IODOpts - IOD options,
 *	{Function} it - Array of functions to execute that validates test,
 * }
 *
 * @param {IOD} IOD - IOD object
 * @returns {Array} - List of SchemaTests
 */
exports.schemaTests = function(IOD) {
	return [
		ASTests.invalidStringType(IOD, 'indexes', 'GPV', action),
		ASTests.invalidStringType(IOD, 'database_match', 'GPV', action),
		ASTests.missingRequired(IOD, 'field_name', 'GPV', action),
		ASTests.invalidStringType(IOD, 'field_name', 'GPV', action),
		ASTests.invalidStringType(IOD, 'text', 'GPV', action),
		ASTests.invalidNumberType(IOD, 'max_values', 'GPV', action),
		ASTests.invalidNumberType(IOD, 'min_score', 'GPV', action),
		ASTests.invalidBooleanType(IOD, 'document_count', 'GPV', action),
		ASTests.invalidEnumValue(IOD, 'sort', 'GPV', action)
	]
}

/**
 * Returns list of action tests.
 * Action tests consist of: {
 * 	{String} name - Name of test,
 * 	{Object} IODOpts - IOD options,
 *	{Function} it - Array of functions to execute that validates test,
 *	{Boolean} shouldError - True if test is expected to error
 * }
 *
 * @param {IOD} IOD - IOD object
 * @param {Object} data - Prepared data for tests
 * @returns {Array} - List of ActionTests
 */
exports.tests = function(IOD, data) {
	var defParams = {
		indexes: 'wiki_eng',
		field_name: 'person_profession',
		text: 'Taylor Swift',
		field_text: 'EXISTS{}:WIKIPEDIA_CATEGORY',
		max_values: 1,
		min_score: 1,
		document_count: true,
		sort: 'off'
	}

	return [
		{
			name: 'field_name=person_profession,i,txt,ft,mv,ms,dc,sort',
			IODOpts: {
				action: T.attempt(U.paths.GPV, action)(IOD),
				params: defParams
			},
			it: U.defIt(action)
		},
		{
			name: 'file=invalid,i,txt,ft,mv,ms,dc,sort',
			IODOpts: {
				action: T.attempt(U.paths.GPV, action)(IOD),
				params: defParams,
				files: ['invalid file path']
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInError, 'ENOENT')
			],
			shouldError: true
		}
	]
}

/**
 * Preparation function. Prepares ActionTests with an object store reference.
 *
 * @param {IOD} IOD - IOD object
 * @param {Function} done - Function(data)
 * @throws {Error} - If error on storeobject action
 * @throws {Error} - If couldn't find reference in results
 */
exports.prepare = function(IOD, done) {
	return done()
}