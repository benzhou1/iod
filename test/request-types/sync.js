/**
 * Test data for sync request type.
 */

'use strict';

var U = require('../utils')
var _ = require('lodash')
var T = require('../../lib/transform')
var RSTests = require('../request-schema-tests-utils')

/**
 * Only supports specific type of actions.
 */
exports.type = 'api'

/**
 * Returns list of Schema Tests for sync request type.
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
		RSTests.invalidApiVer(),
		RSTests.invalidMethod(),
		RSTests.invalidParams(),
		RSTests.invalidFiles(),
		RSTests.invalidRetries(),
		RSTests.invalidErrorCodesArr(),
		RSTests.invalidErrorCodesInt()
	]
}

/**
 * List of sync tests.
 * Sync Tests consist of: {
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
		name: '[GET] - should have gotten results',
		beforeFn: function(IOD, ActionTest, done) {
			IOD.sync(_.defaults({ retries: 3 }, ActionTest.IODOpts), done)
		},
		itFn: function(ActionTest) {
			return ActionTest.it
		},
		skip: function(ActionTest) {
			return !!ActionTest.IODOpts.files
		}
	},
	{
		name: '[POST] - should have gotten results',
		beforeFn: function(IOD, ActionTest, done) {
			var IODOpts = _.defaults({ method: 'post', retries: 3 }, ActionTest.IODOpts)
			IOD.sync(IODOpts, done)
		},
		itFn: function(ActionTest) {
			return ActionTest.it
		}
	}
]