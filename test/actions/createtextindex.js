/**
 * Test data for createtextindex action.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var T = require('../../lib/transform')

var action = 'createtextindex'
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
		U.actSchemaTests.missingRequired(IOD, 'index', 'CREATETI', action),
		U.actSchemaTests.missingRequired(IOD, 'flavor', 'CREATETI', action),
		U.actSchemaTests.invalidStringType(IOD, 'description', 'CREATETI', action)

//		// Status
//		U.actSchemaTests.missingRequired(IOD, 'index', 'INDEXSTATUS', statusAction),
//
//		// List
//		U.actSchemaTests.invalidEnumValue(IOD, 'type', 'LISTTI', listAction),
//		U.actSchemaTests.invalidEnumValue(IOD, 'flavor', 'LISTTI', listAction),
//		U.actSchemaTests.invalidArrayString(IOD, 'type', 'LISTTI', listAction),
//		U.actSchemaTests.invalidArrayString(IOD, 'flavor', 'LISTTI', listAction)
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
	return []
}

/**
 * Preparation function.
 *
 * @param {IOD} IOD - IOD object
 * @param {function} done - Function(data)
 * @throws {Error} - If failed to delete existing test index
 */
exports.prepare = function(IOD, done) {
	done()
}