/**
 * Test data for extracttext action.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var T = require('../../lib/transform')

var action = 'extracttext'
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
		U.actSchemaTests.noinput(IOD, 'EXTRACTTEXT', action),

		{
			name: 'invalid boolean for extract_text',
			IODOpts: {
				action: T.attempt(U.paths.EXTRACTTEXT, action)(IOD),
				params: {
					extract_text: 'not boolean'
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'extract_text')
			]
		},
		{
			name: 'invalid boolean for extract_metadata',
			IODOpts: {
				action: T.attempt(U.paths.EXTRACTTEXT, action)(IOD),
				params: {
					extract_metadata: 'not boolean'
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'extract_metadata')
			]
		},
		{
			name: 'invalid array for additional_metadata',
			IODOpts: {
				action: T.attempt(U.paths.EXTRACTTEXT, action)(IOD),
				params: {
					additional_metadata: 'not array'
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'additional_metadata')
			]
		},
		{
			name: 'invalid array for reference_prefix',
			IODOpts: {
				action: T.attempt(U.paths.EXTRACTTEXT, action)(IOD),
				params: {
					reference_prefix: { key: 'not array' }
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'reference_prefix')
			]
		},
		{
			name: 'invalid array for password',
			IODOpts: {
				action: T.attempt(U.paths.EXTRACTTEXT, action)(IOD),
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
	var defParams = {
		extract_text: true,
		extract_metadata: true,
		additional_metadata: [{
			addMeta: 'addMeta'
		}],
		reference_prefix: 'prefix',
		password: ['1', '2', '3']
	}

	return [
		{
			name: 'url=idolondemand.com/example#2.doc,et,em,addMeta,refPre,pass',
			IODOpts: {
				action: T.attempt(U.paths.EXTRACTTEXT, action)(IOD),
				params: _.defaults({
					url: 'https://www.idolondemand.com/sample-content/documents/' +
						'HP_License_terms_may2012.doc'
				}, defParams)
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'reference=extracttext,et,em,addMeta,refPre,pass',
			IODOpts: {
				action: T.attempt(U.paths.EXTRACTTEXT, action)(IOD),
				params: _.defaults({
					reference: T.attempt(T.get('ref'))(data)
				}, defParams)
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'file=extracttext,et,em,addMeta,refPre,pass',
			IODOpts: {
				action: T.attempt(U.paths.EXTRACTTEXT, action)(IOD),
				params: defParams,
				files: [filePath]
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'file=invalid,et,em,addMeta,refPre,pass',
			IODOpts: {
				action: T.attempt(U.paths.EXTRACTTEXT, action)(IOD),
				params: {
					mode: 'document_photo'
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
	// Can use same reference as analyzesentiment
	U.prepareReference(IOD, 'analyzesentiment', filePath, function(ref) {
		done({ ref: ref })
	})
}
