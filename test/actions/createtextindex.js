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
	return []
}

/**
 * Preparation function.
 *
 * @param {IOD} IOD - IOD object
 * @param {Function} done - Function(data)
 * @throws {Error} - If failed to delete existing test index
 */
exports.prepare = function(IOD, done) {
	done()
}