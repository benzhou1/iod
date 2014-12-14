/**
 * Test data for expandcontainer action.
 */

'use strict';

var U = require('../utils')
var ASTests = require('../action-schema-tests-utils')

var _ = require('lodash')
var should = require('should')
var T = require('../../lib/transform')

var action = 'expandcontainer'
var alias = 'explodecontainer'
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
		ASTests.noInputs(IOD, 'EXPANDCONT', action),
		ASTests.invalidNumberType(IOD, 'depth', 'EXPLODECONT', alias),
		ASTests.invalidArrayString(IOD, 'password', 'EXPANDCONT', action)
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
			name: 'url=idolondemand.com/example.zip,password=[1,2,3],depth=2',
			IODOpts: {
				action: T.attempt(U.paths.EXPANDCONT, action)(IOD),
				params: {
					url: 'https://www.idolondemand.com/sample-content/documents/example.zip',
					password: ['1', '2', '3'],
					depth: 2
				}
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'reference=expandcontainer,password=[1,2,3],depth=2',
			IODOpts: {
				action: T.attempt(U.paths.EXPLODECONT, alias)(IOD),
				params: {
					reference: T.attempt(T.get('ref'))(data),
					password: ['1', '2', '3'],
					depth: 2
				}
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, alias)
			]
		},
		{
			name: 'file=expandcontainer,password=[1,2,3],depth=2',
			IODOpts: {
				action: T.attempt(U.paths.EXPANDCONT, action)(IOD),
				params: {
					password: ['1', '2', '3'],
					depth: 2
				},
				files: [filePath]
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'file=invalid,password=[1,2,3],depth=2',
			IODOpts: {
				action: T.attempt(U.paths.EXPLODECONT, alias)(IOD),
				params: {
					password: ['1', '2', '3'],
					depth: 2
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
 * @param {Function} done - Function(data)
 * @throws {Error} - If error on storeobject action
 * @throws {Error} - If couldn't find reference in results
 */
exports.prepare = function(IOD, done) {
	U.prepare.reference(IOD, action, filePath, function(err, ref) {
		done({ ref: ref })
	})
}