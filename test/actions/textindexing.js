/**
 * Test data for createtextindex and deletetextindex action.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var T = require('../../lib/transform')

var createAction = 'createtextindex'
var deleteAction = 'deletetextindex'
var addAction = 'addtotextindex'
var delFromAction = 'deletefromtextindex'
var statusAction = 'indexstatus'
var listAction = 'listindexes'

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
		// Create
		U.actSchemaTests.missingRequired(IOD, 'index', 'CREATETI', createAction),
		U.actSchemaTests.missingRequired(IOD, 'flavor', 'CREATETI', createAction),
		U.actSchemaTests.invalidStringType(IOD, 'description', 'CREATETI', createAction),

		// Delete
		U.actSchemaTests.missingRequired(IOD, 'index', 'DELETETI', deleteAction),
		U.actSchemaTests.invalidStringType(IOD, 'confirm', 'DELETETI', deleteAction),

		// Add
		U.actSchemaTests.noInputs(IOD, 'ADDTOTI', addAction),
		U.actSchemaTests.missingRequired(IOD, 'index', 'ADDTOTI', addAction),
		U.actSchemaTests.invalidEnumValue(IOD, 'duplicate_mode', 'ADDTOTI', addAction),
		U.actSchemaTests.invalidArrayString(IOD, 'additional_metadata', 'ADDTOTI', addAction),
		U.actSchemaTests.invalidArrayString(IOD, 'reference_prefix', 'ADDTOTI', addAction),

		// Delete From
		U.actSchemaTests.missingRequired(IOD, 'index', 'DELFROMTI', delFromAction),
		U.actSchemaTests.missingRequired(IOD, 'index_reference', 'DELFROMTI', delFromAction),

		// Status
		U.actSchemaTests.missingRequired(IOD, 'index', 'INDEXSTATUS', statusAction),

		// List
		U.actSchemaTests.invalidEnumValue(IOD, 'type', 'LISTTI', listAction),
		U.actSchemaTests.invalidEnumValue(IOD, 'flavor', 'LISTTI', listAction),
		U.actSchemaTests.invalidArrayString(IOD, 'type', 'LISTTI', listAction),
		U.actSchemaTests.invalidArrayString(IOD, 'flavor', 'LISTTI', listAction)
	]
}

// TODO: change all types to caps
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
	return [
		{
			name: 'create index=test,flavor=explorer,description=description',
			IODOpts: {
				action: T.attempt(U.paths.CREATETI, createAction)(IOD),
				params: {
					index: 'test',
					flavor: 'explorer',
					description: 'description'
				}
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, createAction)
			],
			wait: 10
		},
		{
			name: 'delete index=text',
			IODOpts: {
				action: T.attempt(U.paths.DELETETI, deleteAction)(IOD),
				params: {
					index: 'test'
				}
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, deleteAction),
				U.shouldBeConfirm
			]
		},
		{
			name: 'delete index=test,confirm',
			IODOpts: {
				action: T.attempt(U.paths.DELETETI, deleteAction)(IOD),
				params: {
					index: 'test',
					confirm: U.cachedConfirm
				}
			},
			it: [
				U.shouldBeSuccessful,
				U.shouldBeDeleted
			]
		}
	]
}

/**
 * Preparation function. Prepares ActionTests by making sure that the test index
 * doest no already exists.
 *
 * @param {IOD} IOD - IOD object
 * @param {function} done - Function(data)
 * @throws {Error} - If failed to delete existing test index
 */
exports.prepare = function(IOD, done) {
	U.prepareToCreateTextIndex(IOD, done)
}