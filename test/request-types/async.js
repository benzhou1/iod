/**
 * Test data for async request type.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var RSTests = require('../request-schema-tests-utils')

/**
 * Only supports specific type of actions.
 */
exports.type = 'api'

/**
 * Returns list of Schema Tests for async request type.
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
		RSTests.invalidMajorVer(IOD),
		RSTests.invalidAction(IOD),
		RSTests.invalidApiVer(IOD),
		RSTests.invalidMethod(IOD),
		RSTests.invalidParams(IOD),
		RSTests.invalidFiles(IOD),
		RSTests.invalidGetResults(IOD),
		RSTests.invalidPollInterval(IOD)
	]
}

/**
 * List of async tests.
 * Async Tests consist of: {
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
		name: '[GET] - should have waited and gotten results',
		beforeFn: function(IOD, ActionTest, done) {
			var IODOpts = _.defaults({ getResults: true }, ActionTest.IODOpts)
			IOD.async(IODOpts, done)
		},
		itFn: function(ActionTest) {
			return ActionTest.it
		},
		skip: function(ActionTest) {
			return !!ActionTest.IODOpts.files
		}
	},
	{
		name: '[POST] - should have waited and gotten results',
		beforeFn: function(IOD, ActionTest, done) {
			var IODOpts = _.defaults({
				method: 'post',
				getResults: true
			}, ActionTest.IODOpts)

			IOD.async(IODOpts, done)
		},
		itFn: function(ActionTest) {
			return ActionTest.it
		}
	},
	{
		name: '[EVENT] - should have gotten finished event',
		beforeFn: function(IOD, ActionTest, done) {
			var IODOpts = ActionTest.IODOpts

			IOD.async(IODOpts, function(err, res) {
				if (err) done(err)
				else {
					var jobId = res.jobID
					IOD.onFinished(jobId, done)
				}
			})
		},
		itFn: function(ActionTest) {
			return ActionTest.it
		},
		skip: function(ActionTest) {
			return !!ActionTest.shouldError ||
				!!ActionTest.noJobId
		}
	}
]