/**
 * Test data for getparametricvalues action.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var T = require('../../lib/transform')

var action = 'getparametricvalues'
var filePath = __dirname + '/../files/' + action

/**
 * Specific type of action.
 */
exports.type = 'api'

/**
 * Returns list of schema tests for action.
 * Schema Tests consist of: {
 * 	{string} name - Name of test,
 * 	{object} IODOpts - IOD options,
 *	{function} it - Array of functions to execute that validates test,
 * }
 *
 * @param {IOD} IOD - IOD object
 * @returns {Array} - List of SchemaTests
 */
exports.schemaTests = function(IOD) {
	return [
		U.invalidStringType(IOD, 'indexes', 'GPV', action),
		U.invalidStringType(IOD, 'database_match', 'GPV', action),
		U.missingRequired(IOD, 'field_name', 'GPV', action),
		U.invalidStringType(IOD, 'field_name', 'GPV', action),
		U.invalidStringType(IOD, 'text', 'GPV', action),
		U.invalidNumberType(IOD, 'max_values', 'GPV', action),
		U.invalidNumberType(IOD, 'min_score', 'GPV', action),
		U.invalidBooleanType(IOD, 'document_count', 'GPV', action),
		U.invalidEnumValue(IOD, 'sort', 'GPV', action)
	]
}

/**
 * Returns list of action tests.
 * Action tests consist of: {
 * 	{string} name - Name of test,
 * 	{object} IODOpts - IOD options,
 *	{function} it - Array of functions to execute that validates test,
 *	{boolean} shouldError - True if test is expected to error
 * }
 *
 * @param {IOD} IOD - IOD object
 * @param {object} data - Prepared data for tests
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
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
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
 * @param {function} done - Function(data)
 * @throws {Error} - If error on storeobject action
 * @throws {Error} - If couldn't find reference in results
 */
exports.prepare = function(IOD, done) {
	return done()
}