/**
 * Test data for analyzesentiment action.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var T = require('../../lib/transform')

var action = 'analyzesentiment'
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
		{
			name: 'no inputs',
			IODOpts: {
				action: T.attempt(U.paths.SENTIMENT, action)(IOD)
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInError, 'inputs')
			]
		},
		{
			name: 'invalid enum for language',
			IODOpts: {
				action: T.attempt(U.paths.SENTIMENT, action)(IOD),
				params: {
					language: 'blah'
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'enum', 'language')
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
	 * Validates that results have required properties, either directly from response
	 * or from results. For job request we might have two results, attempt to get second
	 * result as well.
	 *
	 * @param {object} env - Environment object
	 */
	var shouldHaveResults = function(env) {
		var results = T.attempt(T.walk(['response', 'actions', 0, 'result']))(env)
		var results2 = T.attempt(T.walk(['response', 'actions', 1, 'result']))(env)
		var shouldHaveSentimentKeys = function(v) {
			v.should.have.properties('positive', 'negative', 'aggregate')
		}

		if (!results) shouldHaveSentimentKeys(env.response)
		else {
			shouldHaveSentimentKeys(results)
			if (results2) shouldHaveSentimentKeys(results2)
		}
	}

	return [
		{
			name: 'text==),language=eng',
			IODOpts: {
				action: T.attempt(U.paths.SENTIMENT, action)(IOD),
				params: {
					text: '=)',
					language: 'eng'
				}
			},
			it: [
				U.shouldBeSuccessful,
				shouldHaveResults
			]
		},
		{
			name: 'url=idolondemand.com,language=eng',
			IODOpts: {
				action: T.attempt(U.paths.SENTIMENT, action)(IOD),
				params: {
					url: 'http://www.idolondemand.com',
					language: 'eng'
				}
			},
			it: [
				U.shouldBeSuccessful,
				shouldHaveResults
			]
		},
		{
			name: 'reference=analyzesentiment' + ',language=eng',
			IODOpts: {
				action: T.attempt(U.paths.SENTIMENT, action)(IOD),
				params: {
					reference: T.attempt(T.get('ref'))(data),
					language: 'eng'
				}
			},
			it: [
				U.shouldBeSuccessful,
				shouldHaveResults
			]
		},
		{
			name: 'file==),language=eng',
			IODOpts: {
				action: T.attempt(U.paths.SENTIMENT, action)(IOD),
				params: {
					language: 'eng'
				},
				files: [filePath]
			},
			it: [
				U.shouldBeSuccessful,
				shouldHaveResults
			]
		},
		{
			name: 'file=invalid,language=eng',
			IODOpts: {
				action: T.attempt(U.paths.SENTIMENT, action)(IOD),
				params: {
					language: 'eng'
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