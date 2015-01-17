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
		RSTests.empty(IOD),
		RSTests.invalidMajorVer(IOD),
		RSTests.invalidAction(IOD),
		RSTests.invalidApiVer(IOD),
		RSTests.invalidMethod(IOD),
		RSTests.invalidParams(IOD),
		RSTests.invalidFiles(IOD),

		{
			name: 'retries not an integer',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				action: T.attempt(U.paths.SENTIMENT)(IOD),
				apiVersion: T.attempt(U.paths.APIV1)(IOD),
				method: 'get',
				params: { text: '=)'},
				files: ['files'],
				getResults: 'not a boolean',
				retries: 'a string'
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'retries')
			]
		}
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
			IOD.sync(ActionTest.IODOpts, done)
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
			var IODOpts = _.defaults({ method: 'post' }, ActionTest.IODOpts)
			IOD.sync(IODOpts, done)
		},
		itFn: function(ActionTest) {
			return ActionTest.it
		}
	}
]