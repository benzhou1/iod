/**
 * Test data for detectfaces action.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var T = require('../../lib/transform')

var action = 'detectfaces'
var alias = 'findfaces'
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
		U.actSchemaTests.noinput(IOD, 'DETFACE', action),

		{
			name: 'invalid boolean for additional',
			IODOpts: {
				action: T.attempt(U.paths.FINDFACE, alias)(IOD),
				params: {
					url: 'url',
					additional: 'not a boolean'
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'additional')
			]
		}
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
			name: 'url=idolondemand.com/faceDetectionExample1.jpg,add=true',
			IODOpts: {
				action: T.attempt(U.paths.DETFACE, action)(IOD),
				params: {
					url: 'https://www.idolondemand.com/sample-content/images/' +
						'faceDetectionExample1.jpg',
					additional: true
				}
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'reference=detectfaces,add=true',
			IODOpts: {
				action: T.attempt(U.paths.FINDFACE, alias)(IOD),
				params: {
					reference: T.attempt(T.get('ref'))(data),
					additional: true
				}
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, alias)
			]
		},
		{
			name: 'file=detectfaces,add=true',
			IODOpts: {
				action: T.attempt(U.paths.DETFACE, action)(IOD),
				params: {
					additional: true
				},
				files: [filePath]
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'file=invalid,add=true',
			IODOpts: {
				action: T.attempt(U.paths.FINDFACE, alias)(IOD),
				params: {
					additional: true
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
