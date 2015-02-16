/**
 * Test data for result request type.
 */

'use strict';

var U = require('../utils')
var RSTests = require('../request-schema-tests-utils')

/**
 * Only supports specific type of actions.
 */
exports.type = 'api'

/**
 * Set to true to not run ActionSchemaTest for result request type.
 */
exports.noActionSchema = true

/**
 * Returns list of Schema Tests for result request type.
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
		RSTests.invalidMethod(),
		RSTests.invalidJobId(),
		RSTests.invalidRetries()
	]
}

/**
 * List of result tests.
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
		name: '[GET] - should have gotten results',
		beforeFn: function(IOD, ActionTest, done) {
			IOD.async(ActionTest.IODOpts, function(err, res) {
				if (err) throw new Error('Failed to get jobId for result test: ' +
					U.prettyPrint(err))
				else if (!res.jobID) throw new Error('JobId not found: ' +
					U.prettyPrint(res))

				IOD.result({ jobId: res.jobID, retries: 3 }, done)
			})
		},
		itFn: function(ActionTest) {
			return ActionTest.it
		},
		skip: function(ActionTest) {
			return !!ActionTest.IODOpts.files ||
				!!ActionTest.shouldError
		}
	},
	{
		name: '[POST] - should have gotten results',
		beforeFn: function(IOD, ActionTest, done) {
			IOD.async(ActionTest.IODOpts, function(err, res) {
				if (err) throw new Error('Failed to get jobId for result test: ' +
					U.prettyPrint(err))
				else if (!res.jobID) throw new Error('JobId not found: ' +
					U.prettyPrint(res))

				IOD.result({ jobId: res.jobID, method: 'post', retries: 3 }, done)
			})
		},
		itFn: function(ActionTest) {
			return ActionTest.it
		},
		skip: function(ActionTest) {
			return !!ActionTest.shouldError
		}
	}
]

