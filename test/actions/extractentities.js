/**
 * Test data for extractentities action.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var T = require('../../lib/transform')

var action = 'extractentities'
var alias = 'extractentity'
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
		U.actSchemaTests.noInputs(IOD, 'EENTITIES', action, { entity_type: 'people_eng' }),
		U.actSchemaTests.missingRequired(IOD, 'entity_type', 'EENTITY', alias),
		U.actSchemaTests.invalidEnumValue(IOD, 'entity_type', 'EENTITIES', action),
		U.actSchemaTests.invalidArrayString(IOD, 'entity_type', 'EENTITY', alias),
		U.actSchemaTests.invalidBooleanType(IOD, 'show_alternatives', 'EENTITIES', action)
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
	return [
		{
			name: 'text=Taylor Swift,et=people_eng,sa=true',
			IODOpts: {
				action: T.attempt(U.paths.EENTITIES, action)(IOD),
				params: {
					text: 'Taylor Swift',
					entity_type: 'people_eng',
					show_alternatives: true
				}
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'url=idolondemand.com,et=companies_eng,sa=true',
			IODOpts: {
				action: T.attempt(U.paths.EENTITY, alias)(IOD),
				params: {
					url: 'http://www.idolondemand.com',
					entity_type: 'companies_eng',
					show_alternatives: true
				}
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, alias)
			]
		},
		{
			name: 'reference=extractentities,et=people_eng,sa=true',
			IODOpts: {
				action: T.attempt(U.paths.EENTITIES, action)(IOD),
				params: {
					reference: T.attempt(T.get('ref'))(data),
					entity_type: 'people_eng',
					show_alternatives: true
				}
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'file=Taylor Swift,et=people_eng,sa=true',
			IODOpts: {
				action: T.attempt(U.paths.EENTITY, alias)(IOD),
				params: {
					entity_type: 'people_eng',
					show_alternatives: true
				},
				files: [filePath]
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, alias)
			]
		},
		{
			name: 'file=invalid,et=people_eng,sa=true',
			IODOpts: {
				action: T.attempt(U.paths.EENTITIES, action)(IOD),
				params: {
					entity_type: 'people_eng',
					show_alternatives: true
				},
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
	U.prepareReference(IOD, action, filePath, function(ref) {
		done({ ref: ref })
	})
}