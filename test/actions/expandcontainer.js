/**
 * Test data for expandcontainer action.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var T = require('../../lib/transform')

var action = 'expandcontainer'
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
		U.actSchemaTests.noinput(IOD, 'SENTIMENT', action),

		{
			name: 'invalid number for depth',
			IODOpts: {
				action: T.attempt(U.paths.EXPANDCONT, action)(IOD),
				params: {
					depth: 'blah'
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'depth')
			]
		},
		{
			name: 'invalid array for password',
			IODOpts: {
				action: T.attempt(U.paths.EXPANDCONT, action)(IOD),
				params: {
					password: { key: 'not array' }
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'password')
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
	/**
	 * Validates that results contains `files` property and that is is not empty, either
	 * directly from response or from results. For job request we might have two results,
	 * attempt to get second result as well.
	 *
	 * @param {object} env - Environment object
	 */
	var shouldHaveResults = function(env) {
		var results = T.attempt(T.walk(['response', 'actions', 0, 'result']))(env)
		var results2 = T.attempt(T.walk(['response', 'actions', 1, 'result']))(env)
		var shouldHaveExpanded = function(v) {
			if (!v.files || _.size(v.files) === 0) {
				console.log('Results for expandcontainer fails test: ', U.prettyPrint(v))
			}
			should.exists(v.files)
			_.size(v.files).should.not.be.eql(0)
		}

		if (!results) shouldHaveExpanded(env.response)
		else {
			shouldHaveExpanded(results)
			if (results2) shouldHaveExpanded(results2)
		}
	}

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
				shouldHaveResults
			]
		},
		{
			name: 'reference=expandcontainer,password=[1,2,3],depth=2',
			IODOpts: {
				action: T.attempt(U.paths.EXPANDCONT, action)(IOD),
				params: {
					reference: T.attempt(T.get('ref'))(data),
					password: ['1', '2', '3'],
					depth: 2
				}
			},
			it: [
				U.shouldBeSuccessful,
				shouldHaveResults
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
				shouldHaveResults
			]
		},
		{
			name: 'file=invalid,password=[1,2,3],depth=2',
			IODOpts: {
				action: T.attempt(U.paths.EXPANDCONT, action)(IOD),
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
 * @param {function} done - Function(data)
 * @throws {Error} - If error on storeobject action
 * @throws {Error} - If couldn't find reference in results
 */
exports.prepare = function(IOD, done) {
	var IODOpts = {
		action: T.attempt(U.paths.STOREOBJ, 'storeobject')(IOD),
		files: [filePath],
		getResults: true
	}
	IOD.async(IODOpts, function(err, res) {
		if (err) throw new Error('Failed to prepare for analyzesentiment tests: ' +
			U.prettyPrint(err))
		else {
			var ref = T.attempt(U.paths.REF)(res)
			if (!ref) throw new Error('Could not find reference from store object: ' +
				U.prettyPrint(res))

			done({ ref: ref })
		}
	})
}