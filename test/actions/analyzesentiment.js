/**
 * Test data for analyzesentiment action.
 */

'use strict';

var U = require('../utils')
var ASTests = require('../action-schema-tests-utils')

var _ = require('lodash')
var should = require('should')
var T = require('../../lib/transform')

var action = 'analyzesentiment'
var alias = 'detectsentiment'
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
		ASTests.noInputs(IOD, 'SENTIMENT', action),
		ASTests.invalidEnumValue(IOD, 'language', 'DETECTSENT', alias)
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
			name: 'text==),language=eng',
			IODOpts: {
				action: T.attempt(U.paths.SENTIMENT, action)(IOD),
				params: {
					text: '=)',
					language: 'eng'
				}
			},
			it: U.defIt(action)
		},
		{
			name: 'url=idolondemand.com,language=eng',
			IODOpts: {
				action: T.attempt(U.paths.DETECTSENT, alias)(IOD),
				params: {
					url: 'http://www.idolondemand.com',
					language: 'eng'
				}
			},
			it: U.defIt(action)
		},
		{
			name: 'reference=analyzesentiment,language=eng',
			IODOpts: {
				action: T.attempt(U.paths.SENTIMENT, action)(IOD),
				params: {
					reference: T.attempt(T.get('ref'))(data),
					language: 'eng'
				}
			},
			it: U.defIt(action)
		},
		{
			name: 'file==),language=eng',
			IODOpts: {
				action: T.attempt(U.paths.DETECTSENT, alias)(IOD),
				params: {
					language: 'eng'
				},
				files: [filePath]
			},
			it: U.defIt(alias)
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
 * @param {Function} done - Function(data)
 * @throws {Error} - If error on storeobject action
 * @throws {Error} - If couldn't find reference in results
 */
exports.prepare = function(IOD, done) {
	U.prepare.reference(IOD, action, filePath, function(err, ref) {
		done({ ref: ref })
	})
}