/**
 * Test data for analyzesentiment action.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var T = require('../../lib/transform')

var action = 'analyzesentiment'
var filePath = function(i) {
	return __dirname + '/../files/' + action + i + '.txt'
}

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
	var action = T.attempt(U.paths.SENTIMENT)(IOD)

	return [
		{
			name: 'no inputs',
			IODOpts: {
				action: action
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInError, 'inputs')
			]
		},
		{
			name: 'invalid enum for language',
			IODOpts: {
				action: action,
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
 * }
 *
 * @param {IOD} IOD - IOD object
 * @param {object} data - Prepared data for tests
 * @returns {Array} - List of ActionTests
 */
exports.tests = function(IOD, data) {
	/**
	 * Validates that results have required properties, either directly from response
	 * or from results.
	 *
	 * @param {object} env - Environment object
	 */
	var shouldHaveResults = function(env) {
		var results = T.attempt(T.walk(['response', 'actions', 0, 'result']))(env)

		if (!results) env.response.should.have
			.properties('positive', 'negative', 'aggregate')
		else results.should.have.properties('positive', 'negative', 'aggregate')
	}

	return [
		{
			name: 'text==),language=eng',
			IODOpts: {
				action: T.attempt(U.paths.SENTIMENT)(IOD),
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
				action: T.attempt(U.paths.SENTIMENT)(IOD),
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
			name: 'reference=analyzesentiment1.txt' + ',language=eng',
			IODOpts: {
				action: T.attempt(U.paths.SENTIMENT)(IOD),
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
				action: T.attempt(U.paths.SENTIMENT)(IOD),
				params: {
					language: 'eng'
				},
				files: [filePath(1)]
			},
			it: [
				U.shouldBeSuccessful,
				shouldHaveResults
			]
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
		action: T.attempt(U.paths.STOREOBJ)(IOD),
		files: [filePath(1)],
		getResults: true
	}
	IOD.async(IODOpts, function(err, res) {
		if (err) throw new Error('Failed to prepare for analyzesentiment tests: ' +
			JSON.stringify(err, null, 2))
		else {
			var ref = T.attempt(T.walk(['actions', 0, 'result', 'reference']))(res)
			if (!ref) throw new Error('Could not find reference from store object: ' +
				JSON.stringify(res, null, 2))

			done({ ref: ref })
		}
	})
}