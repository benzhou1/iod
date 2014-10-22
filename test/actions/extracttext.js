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
		U.actSchemaTests.noInputs(IOD, 'EXTRACTTEXT', action),
		U.actSchemaTests.invalidBooleanType(IOD, 'extract_text', 'EXTRACTTEXT', action),
		U.actSchemaTests.invalidBooleanType(IOD, 'extract_metadata', 'EXTRACTTEXT', action),
		U.actSchemaTests.invalidArrayObj(IOD, 'additional_metadata', 'EXTRACTTEXT', action),
		U.actSchemaTests.invalidArrayString(IOD, 'reference_prefix', 'EXTRACTTEXT', action),
		U.actSchemaTests.invalidArrayString(IOD, 'password', 'EXTRACTTEXT', action),
		U.actSchemaTests.uneqlFileAddMeta(IOD, filePath, 'EXTRACTTEXT', action),
		U.actSchemaTests.uneqlFileRefPref(IOD, filePath, 'EXTRACTTEXT', action)
	]
}

/**
 * Returns list of action tests.
 * Action tests consist of: {
 * 	{string} name - Name of test,
 * 	{object} IODOpts - IOD options,
 *	{function} it - Array of functions to execute that validates test,
 *	{boolean} shouldError - True if test is expected to error
 *	{boolean} multFiles - True if test contains multiple files
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
			name: 'file=multiple,et,em,addMeta,refPre,pass',
			IODOpts: {
				action: T.attempt(U.paths.EXTRACTTEXT, action)(IOD),
				params: _.defaults({
					additional_metadata: [
						{ addMeta: 'addMeta' },
						{ addMeta: 'addMeta' },
						{ addMeta: 'addMeta' }
					],
					reference_prefix: ['prefix', 'prefix', 'prefix']
				}, defParams),
				files: [filePath, filePath, filePath]
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			],
			multFiles: true
		},
		{
			name: 'file=invalid,et,em,addMeta,refPre,pass',
			IODOpts: {
				action: T.attempt(U.paths.EXTRACTTEXT, action)(IOD),
				params: defParams,
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
	U.prepare.reference(IOD, 'analyzesentiment', filePath, function(err, ref) {
		done({ ref: ref })
	})
}
