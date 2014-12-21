/**
 * Test data for retrieveindexfields action.
 */

'use strict';

var U = require('../utils')
var ASTests = require('../action-schema-tests-utils')

var should = require('should')
var T = require('../../lib/transform')

var action = 'retrieveindexfields'

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
		ASTests.invalidStringType(IOD, 'indexes', 'RETRIEVEIF', action),
		ASTests.invalidBooleanType(IOD, 'group_fields_by_type', 'RETRIEVEIF', action),
		ASTests.invalidArrayString(IOD, 'fieldtype', 'RETRIEVEIF', action),
		ASTests.invalidNumberType(IOD, 'max_values', 'GETCRETRIEVEIFONT', action)
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
		group_field_by_type: true,
		fieldtype: ['index', 'parametric'],
		max_values: 10
	}

	return [
		{
			name: 'indexes=wiki_eng,gfbt=true,fieldtype=index,parametric,max_values=10',
			IODOpts: {
				action: T.attempt(U.paths.RETRIEVEIF, action)(IOD),
				params: defParams
			},
			it: U.defIt(action)
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