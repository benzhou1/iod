/**
 * Test data for test indexing actions.
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
var prependCreateAction = ASTests.withPrepend(createAction)
var statusAction = 'indexstatus'
var prependStatusAction = ASTests.withPrepend(statusAction)
var listAction = 'listindexes'
var prependListAction = ASTests.withPrepend(listAction)
var listRAction = 'listresources'
var prependListRAction = ASTests.withPrepend(listRAction)
var deleteAction = 'deletetextindex'
var prependDeleteAction = ASTests.withPrepend(deleteAction)
var deleteFromAction = 'deletefromtextindex'
var prependDelFromAction = ASTests.withPrepend(deleteFromAction)

var action = 'addtotextindex'
var prependAddAction = ASTests.withPrepend(action)
var filePath = __dirname + '/../files/' + action

/**
 * Specific type of action.
 */
exports.type = 'api'

/**
 * List of request-types to skip.
 */
exports.skipTypes = ['result', 'status', 'job']

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
	var defParams = {
		index: 'index',
		flavor: 'standard'
	}

	return [
		// Addtotextindex
		prependAddAction.withRequired({ index: 'test' }).noInputs(IOD, 'ADDTOTI', action),
		prependAddAction.missingRequired(IOD, 'index', 'ADDTOTI', action),
		prependAddAction.invalidStringType(IOD, 'index', 'ADDTOTI', action),
		prependAddAction.invalidEnumValue(IOD, 'duplicate_mode', 'ADDTOTI', action),
		prependAddAction.invalidArrayObj(IOD, 'additional_metadata', 'ADDTOTI', action),
		prependAddAction.invalidArrayString(IOD, 'reference_prefix', 'ADDTOTI', action),
		ASTests.withRequired({ index: 'test' }).uneqlFileAddMeta(IOD, filePath, 'ADDTOTI', action),
		prependAddAction.uneqlFileRefPref(IOD, filePath, 'ADDTOTI', action, { index: 'test' }),

		// Createtextindex
		prependCreateAction.missingRequired(IOD, 'index', 'CREATETI', createAction),
		prependCreateAction.invalidStringType(IOD, 'index', 'CREATETI', createAction),
		prependCreateAction.missingRequired(IOD, 'flavor', 'CREATETI', createAction),
		prependCreateAction.invalidStringType(IOD, 'flavor', 'CREATETI', createAction),
		prependCreateAction.invalidStringType(IOD, 'description', 'CREATETI', createAction),

		// Basic createtextindex standard
		ASTests.withRequired(defParams)
			.invalidNumberType(IOD, 'expire_time', 'CREATETI', createAction),
		// TODO: wait for fix in flavors items
//		ASTests.withRequired(defParams)
//			.invalidArrayString(IOD, 'index_fields', 'CREATETI', createAction),
//		ASTests.withRequired(defParams)
//			.invalidArrayString(IOD, 'parametric_fields', 'CREATETI', createAction),

		// Deletetextindex
		prependDeleteAction.missingRequired(IOD, 'index', 'DELETETI', deleteAction),
		prependDeleteAction.invalidStringType(IOD, 'index', 'DELETETI', deleteAction),
		prependDeleteAction.invalidStringType(IOD, 'confirm', 'DELETETI', deleteAction),

		// Deletefromtextindex
		// TODO: wait for fix in production for index_reference
		prependDelFromAction.missingRequired(IOD, 'index', 'DELFROMTI', deleteFromAction),
		prependDelFromAction.invalidStringType(IOD, 'index', 'DELFROMTI', deleteFromAction),
//		prependDelFromAction.withRequired({ index: 'test1' })
// 			.invalidArrayString(IOD, 'index_reference', 'DELFROMTI', deleteFromAction),
		prependDelFromAction.withRequired({ index: 'test1' })
			.invalidBooleanType(IOD, 'delete_all_documents', 'DELFROMTI', deleteFromAction),

		// Indexstatus
		prependStatusAction.missingRequired(IOD, 'index', 'INDEXSTATUS', statusAction),
		prependStatusAction.invalidStringType(IOD, 'index', 'INDEXSTATUS', statusAction),

		// Listindexes
		prependListAction.invalidEnumValue(IOD, 'type', 'LISTI', listAction),
		prependListAction.invalidEnumValue(IOD, 'flavor', 'LISTI', listAction),
		prependListAction.invalidArrayString(IOD, 'type', 'LISTI', listAction),
		prependListAction.invalidArrayString(IOD, 'flavor', 'LISTI', listAction),

		// Listresources
		prependListRAction.invalidEnumValue(IOD, 'type', 'LISTR', listRAction),
		prependListRAction.invalidEnumValue(IOD, 'flavor', 'LISTR', listRAction),
		prependListRAction.invalidArrayString(IOD, 'type', 'LISTR', listRAction),
		prependListRAction.invalidArrayString(IOD, 'flavor', 'LISTR', listRAction)
	]
}

/**
 * Returns list of action tests.
 * Action tests consist of: {
 * 	{String} name - Name of test,
 * 	{Object} IODOpts - IOD options,
 *	{Function} it - Array of functions to execute that validates test,
 *	{Boolean} shouldError - True if test is expected to error
 *	{Number} wait - Number of seconds to wait before running next test,
 *	{Boolean} noJobId - True to skip jobId test
 * }
 *
 * @param {IOD} IOD - IOD object
 * @param {Object} data - Prepared data for tests
 * @returns {Array} - List of ActionTests
 */
exports.tests = function(IOD, data) {
	var defParams = {
		index: U.testIndex,
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

	var tests = [
//		{
//			name: 'create index=test,flavor=explorer',
//			IODOpts: {
//				action: T.attempt(U.paths.CREATETI, createAction)(IOD),
//				params: {
//					index: U.testIndex,
//					flavor: 'explorer'
//				}
//			},
//			wait: 120,
//			it: [
//				U.shouldBeSuccessful,
//				_.partial(U.shouldHaveResults, createAction)
//			]
//		},
		{
			name: 'add json=doc,index=test,dm=duplicate,addmeta,refPref',
			IODOpts: {
				action: T.attempt(U.paths.ADDTOTI, action)(IOD),
				params: _.defaults({ json: json }, defParams)
			},
			it: U.defIt(action)
		},
		{
			name: 'add url=idolondemand.com,dm=duplicate,addmeta,refPref',
			IODOpts: {
				action: T.attempt(U.paths.ADDTOTI, action)(IOD),
				params: _.defaults({
					url: 'https://www.idolondemand.com'
				}, defParams)
			},
			it: U.defIt(action)
		},
		{
			name: 'add reference=addtotextindex,dm=duplicate,addmeta,refPref',
			IODOpts: {
				action: T.attempt(U.paths.ADDTOTI, action)(IOD),
				params: _.defaults({
					reference: T.attempt(T.get('ref'))(data)
				}, defParams)
			},
			it: U.defIt(action)
		},
		{
			name: 'add file=addtotextindex,dm=duplicate,addmeta,refPref',
			IODOpts: {
				action: T.attempt(U.paths.ADDTOTI, action)(IOD),
				params: defParams,
				files: [filePath]
			},
			it: U.defIt(action)
		},
		{
			name: 'add file=multiple,dm=duplicate,addmeta,refPref',
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
			it: U.defIt(action),
			multFiles: true
		},
		{
			name: 'add file=invalid,dm=duplicate,addmeta,refPref',
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
		},
		{
			name: 'deletefrom index=test,index_reference=reference',
			IODOpts: {
				action: T.attempt(U.paths.DELFROMTI, deleteFromAction)(IOD),
				params: {
					index: U.testIndex,
					index_reference: ['reference']
				}
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, deleteFromAction)
			]
		},
		// TODO: wait for fix in production for delete_all_documents
//		{
//			name: 'deletefrom index=test,delete_all_documents=true',
//			IODOpts: {
//				action: T.attempt(U.paths.DELFROMTI, deleteFromAction)(IOD),
//				params: {
//					index: U.testIndex,
//					delete_all_documents: true
//				}
//			},
//			it: [
//				U.shouldBeSuccessful,
//				_.partial(U.shouldHaveResults, deleteFromAction)
//			]
//		},
		{
			name: 'indexstatus index=test',
			IODOpts: {
				action: T.attempt(U.paths.INDEXSTATUS, statusAction)(IOD),
				params: { index: U.testIndex }
			},
			it: [
				U.shouldBeSuccessful,
				// TODO: wait for indexstatus schema fix
//				_.partial(U.shouldHaveResults, statusAction)
			]
		},
//		{
//			name: 'delete index=test,confirm',
//			IODOpts: {
//				action: T.attempt(U.paths.DELETETI, deleteAction)(IOD),
//				params: {
//					index: U.testIndex,
//					confirm: T.attempt(T.get('confirm'))(data)
//				}
//			},
//			it: [
//				U.shouldBeSuccessful,
//				_.partial(U.shouldHaveResults, deleteAction)
//			]
//		}
	]

	// Skip jobId tests
	return _.map(tests, function(test) {
		test.noJobId = true
		return test
	})
}

/**
 * Preparation function.
 * 1.) Prepare a clean test index if it isn't already deleted.
 * 2.) Prepares a delete token for test index.
 * 3.) Prepare object store reference.
 *
 * @param {IOD} IOD - IOD object
 * @param {Function} callback - Function(data)
 * @throws {Error} - If failed to delete existing test index
 */
// TODO: right now requires that test index already exists
exports.prepare = function(IOD, callback) {
	async.series({
//		clean: apply(U.prepare.cleanIndex, IOD),
//
//		confirm: apply(U.prepare.confirmToken, IOD),
		// Always get a new store object reference
		ref: apply(U.prepare.reference, IOD, 'nocache', filePath)
	}, function(err, res) {
		callback(res)
	})
}