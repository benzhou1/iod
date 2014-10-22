/**
 * Test data for addtotextindex action.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var T = require('../../lib/transform')

var async = require('../../lib/async-ext')
var apply = async.apply

var action = 'addtotextindex'
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
		U.actSchemaTests.noInputs(IOD, 'ADDTOTI', action, { index: 'test' }),
		U.actSchemaTests.missingRequired(IOD, 'index', 'ADDTOTI', action),
		U.actSchemaTests.invalidEnumValue(IOD, 'duplicate_mode', 'ADDTOTI', action),
		U.actSchemaTests.invalidArrayObj(IOD, 'additional_metadata', 'ADDTOTI', action),
		U.actSchemaTests.invalidArrayString(IOD, 'reference_prefix', 'ADDTOTI', action),
		U.actSchemaTests.uneqlFileAddMeta(IOD, filePath, 'ADDTOTI', action, { index: 'test' }),
		U.actSchemaTests.uneqlFileRefPref(IOD, filePath, 'ADDTOTI', action, { index: 'test' })
	]
}

/**
 * Returns list of action tests.
 * Action tests consist of: {
 * 	{string} name - Name of test,
 * 	{object} IODOpts - IOD options,
 *	{function} it - Array of functions to execute that validates test,
 *	{boolean} shouldError - True if test is expected to error
 *	{number} wait - Number of seconds to wait before running next test
 * }
 *
 * @param {IOD} IOD - IOD object
 * @param {object} data - Prepared data for tests
 * @returns {Array} - List of ActionTests
 */
exports.tests = function(IOD, data) {
	var defParams = {
		index: 'test',
		duplicate_mode: 'replace',
		additional_metadata: { addMeta: 'addMeta' },
		reference_prefix: 'prefix'
	}
	var json = {
		documents: [{
			title : 'Title',
			reference : 'reference',
			myfield : ['myfield'],
			content : 'content'
		}]
	}

	return [
		{
			name: 'json=doc,index=test,dm=duplicate,addmeta,refPref',
			IODOpts: {
				action: T.attempt(U.paths.ADDTOTI, action)(IOD),
				params: _.defaults({ json: json }, defParams)
			},
			it: [
				U.shouldBeSuccessful,
				// TODO: wait for response schema fix
//				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'url=idolondemand.com,dm=duplicate,addmeta,refPref',
			IODOpts: {
				action: T.attempt(U.paths.ADDTOTI, action)(IOD),
				params: _.defaults({
					url: 'https://www.idolondemand.com'
				}, defParams)
			},
			it: [
				U.shouldBeSuccessful,
//				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'reference=addtotextindex,dm=duplicate,addmeta,refPref',
			IODOpts: {
				action: T.attempt(U.paths.ADDTOTI, action)(IOD),
				params: _.defaults({
					reference: T.attempt(T.get('ref'))(data)
				}, defParams)
			},
			it: [
				U.shouldBeSuccessful,
//				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'file=addtotextindex,dm=duplicate,addmeta,refPref',
			IODOpts: {
				action: T.attempt(U.paths.ADDTOTI, action)(IOD),
				params: defParams,
				files: [filePath]
			},
			it: [
				U.shouldBeSuccessful,
//				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'file=multiple,dm=duplicate,addmeta,refPref',
			IODOpts: {
				action: T.attempt(U.paths.ADDTOTI, action)(IOD),
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
//				_.partial(U.shouldHaveResults, action)
			],
			multFiles: true
		},
		{
			name: 'file=invalid,dm=duplicate,addmeta,refPref',
			IODOpts: {
				action: T.attempt(U.paths.ADDTOTI, action)(IOD),
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
 * Preparation function.
 * 1.) Prepare test index if it isn't already created.
 * 2.) Prepare object store reference.
 *
 * @param {IOD} IOD - IOD object
 * @param {function} done - Function(data)
 * @throws {Error} - If failed to delete existing test index
 */
exports.prepare = function(IOD, done) {
	async.waterfall([
		apply(U.prepare.textIndex, IOD),
		// Can use same reference as analyzesentiment
		apply(U.prepare.reference, IOD, "analyzesentiment", filePath)
	], function(err, res) {
		done(res)
	})
}