/**
 * Test data for discovery request type.
 */

'use strict';

var _ = require('lodash')
var RSTests = require('../request-schema-tests-utils')

/**
 * Only supports specific type of actions.
 */
exports.type = 'discovery'

/**
 * Set to true to not run ActionSchema tests for status request type.
 */
exports.noActionSchema = true

/**
 * Returns list of Schema Tests for discovery request type.
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
		RSTests.empty(),
		RSTests.invalidMajorVer(),
		RSTests.invalidAction(),
		RSTests.invalidMethod(),
		RSTests.invalidParams(),
		RSTests.invalidRetries(),
		RSTests.invalidErrorCodesArr(),
		RSTests.invalidErrorCodesInt()
	]
}

/**
 * List of status tests.
 * Status Tests consist of: {
 * 	{String} name - Name of test,
 * 	{Function} beforeFn - function that executes test,
 *	{Function} itFn - Returns array of functions to execute that validates test,
 *  {Function} skip - Returns true to skip action test.
 * }
 *
 * @type {Array}
 */
exports.tests = [
	{
		name: '[GET] - should have gotten 5 apis',
		beforeFn: function(IOD, ActionTest, done) {
			IOD.discovery(ActionTest.IODOpts, done)
		},
		itFn: function(ActionTest) {
			return ActionTest.it
		}
	},
	{
		name: '[POST] - should have gotten 5 apis',
		beforeFn: function(IOD, ActionTest, done) {
			var IODOpts = _.defaults({ method: 'post'}, ActionTest.IODOpts)
			IOD.discovery(IODOpts, done)

		},
		itFn: function(ActionTest) {
			return ActionTest.it
		}
	}
]

