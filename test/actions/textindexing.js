/**
 * Test data for addtotextindex action.
 */

'use strict';

var U = require('../utils')
var ASTests = require('../action-schema-tests-utils')

var _ = require('lodash')
var should = require('should')
var T = require('../../lib/transform')

var async = require('../../lib/async-ext')
var apply = async.apply

var createAction = 'createtextindex'
var statusAction = 'indexstatus'
var listAction = 'listindexes'
var listRAction = 'listresources'
var deleteAction = 'deletetextindex'
var deleteFromAction = 'deletefromtextindex'

var action = 'addtotextindex'
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
		// Addtotextindex
		ASTests.withRequired({ index: 'test' }).noInputs(IOD, 'ADDTOTI', action),
		ASTests.missingRequired(IOD, 'index', 'ADDTOTI', action),
		ASTests.invalidEnumValue(IOD, 'duplicate_mode', 'ADDTOTI', action),
		ASTests.invalidArrayObj(IOD, 'additional_metadata', 'ADDTOTI', action),
		ASTests.invalidArrayString(IOD, 'reference_prefix', 'ADDTOTI', action),
		ASTests.withRequired({ index: 'test' }).uneqlFileAddMeta(IOD, filePath, 'ADDTOTI', action),
		ASTests.uneqlFileRefPref(IOD, filePath, 'ADDTOTI', action, { index: 'test' }),

		// Createtextindex
		ASTests.missingRequired(IOD, 'index', 'CREATETI', createAction),
		ASTests.missingRequired(IOD, 'flavor', 'CREATETI', createAction),
		ASTests.invalidStringType(IOD, 'description', 'CREATETI', createAction),

		// Deletetextindex
		ASTests.missingRequired(IOD, 'index', 'DELETETI', deleteAction),
		ASTests.invalidStringType(IOD, 'confirm', 'DELETETI', deleteAction),

		// Deletefromtextindex
		// TODO: wait for fix in production for index_reference
		ASTests.missingRequired(IOD, 'index', 'DELFROMTI', deleteFromAction),
//		ASTests.withRequired({ index: 'test1' }).invalidArrayString(IOD, 'index_reference',
//			'DELFROMTI', deleteFromAction),
		ASTests.withRequired({ index: 'test1' }).invalidBooleanType(IOD, 'delete_all_documents',
			'DELFROMTI', deleteFromAction),

		// Indexstatus
		ASTests.missingRequired(IOD, 'index', 'INDEXSTATUS', statusAction),

		// Listindexes
		ASTests.invalidEnumValue(IOD, 'type', 'LISTI', listAction),
		ASTests.invalidEnumValue(IOD, 'flavor', 'LISTI', listAction),
		ASTests.invalidArrayString(IOD, 'type', 'LISTI', listAction),
		ASTests.invalidArrayString(IOD, 'flavor', 'LISTI', listAction),

		// Listresources
		ASTests.invalidEnumValue(IOD, 'type', 'LISTR', listRAction),
		ASTests.invalidEnumValue(IOD, 'flavor', 'LISTR', listRAction),
		ASTests.invalidArrayString(IOD, 'type', 'LISTR', listRAction),
		ASTests.invalidArrayString(IOD, 'flavor', 'LISTR', listRAction)
	]
}

/**
 * Returns list of action tests.
 * Action tests consist of: {
 * 	{String} name - Name of test,
 * 	{Object} IODOpts - IOD options,
 *	{Function} it - Array of functions to execute that validates test,
 *	{Boolean} shouldError - True if test is expected to error
 *	{Number} wait - Number of seconds to wait before running next test
 * }
 *
 * @param {IOD} IOD - IOD object
 * @param {Object} data - Prepared data for tests
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
				_.partial(U.shouldHaveResults, action)
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
				_.partial(U.shouldHaveResults, action)
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
				_.partial(U.shouldHaveResults, action)
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
				_.partial(U.shouldHaveResults, action)
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
				_.partial(U.shouldHaveResults, action)
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
 * @param {Function} done - Function(data)
 * @throws {Error} - If failed to delete existing test index
 */
exports.prepare = function(IOD, done) {
	async.waterfall([
		apply(U.prepare.textIndex, IOD),
		// Always get a new store object reference
		apply(U.prepare.reference, IOD, 'nocache', filePath)
	], function(err, res) {
		done({ ref: res })
	})
}