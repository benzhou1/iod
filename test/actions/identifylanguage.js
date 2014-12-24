/**
 * Test data for identifylanguage action.
 */

'use strict';

var U = require('../utils')
var ASTests = require('../action-schema-tests-utils')

var _ = require('lodash')
var should = require('should')
var T = require('../../lib/transform')

var action = 'identifylanguage'
var alias = 'detectlanguage'
var filePath = __dirname + '/../files/' + action

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
		ASTests.noInputs(IOD, 'IDLANG', action),
		ASTests.invalidBooleanType(IOD, 'additional_metadata', 'DETLANG', alias)
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
	return [
		{
			name: 'text=cats and dogs,additional_metadata=true',
			IODOpts: {
				action: T.attempt(U.paths.IDLANG, action)(IOD),
				params: {
					text: 'cats and dogs',
					additional_metadata: true
				}
			},
			it: U.defIt(action)
		},
		{
			name: 'url=idolondemand.com,additional_metadata=true',
			IODOpts: {
				action: T.attempt(U.paths.DETLANG, alias)(IOD),
				params: {
					url: 'http://www.idolondemand.com',
					additional_metadata: true
				}
			},
			it: U.defIt(alias)
		},
		{
			name: 'reference=identifylanguage,additional_metadata=true',
			IODOpts: {
				action: T.attempt(U.paths.IDLANG, action)(IOD),
				params: {
					reference: T.attempt(T.get('ref'))(data),
					additional_metadata: true
				}
			},
			it: U.defIt(action)
		},
		{
			name: 'file=cats and dogs,additional_metadata=true',
			IODOpts: {
				action: T.attempt(U.paths.DETLANG, alias)(IOD),
				params: { additional_metadata: true	},
				files: [filePath]
			},
			it: U.defIt(alias)
		},
		{
			name: 'file=invalid,additional_metadata=true',
			IODOpts: {
				action: T.attempt(U.paths.IDLANG, action)(IOD),
				params: { additional_metadata: true	},
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
	// Can use same reference as findrelatedconcepts
	U.prepare.reference(IOD, 'findrelatedconcepts', filePath, function(err, ref) {
		done({ ref: ref })
	})
}