/**
 * Test data for discovery request type.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var T = require('../../lib/transform')

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
		U.reqSchemaTests.empty(IOD),
		U.reqSchemaTests.invalidMajorVer(IOD),
		U.reqSchemaTests.invalidAction(IOD),
		U.reqSchemaTests.invalidMethod(IOD),
		U.reqSchemaTests.invalidParams(IOD)
	]
}

/**
 * List of status tests.
 * Status Tests consist of: {
 * 	{string} name - Name of test,
 * 	{function} beforeFn - function that executes test,
 *	{function} itFn - Returns array of functions to execute that validates test,
 *  {function} skip - Returns true to skip action test.
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

