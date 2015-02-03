/**
 * Test data for status request type.
 */

'use strict';

var U = require('../utils')
var RSTests = require('../request-schema-tests-utils')

/**
 * Only supports specific type of actions.
 */
exports.type = 'api'

/**
 * Set to true to not run ActionSchema tests for status request type.
 */
exports.noActionSchema = true

/**
 * Returns list of Schema Tests for status request type.
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
		RSTests.invalidJobId()
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
		name: '[GET] - should have gotten status',
		beforeFn: function(IOD, ActionTest, done) {
			IOD.async(ActionTest.IODOpts, function(err, res) {
				if (err) throw new Error('Failed to get jobId for status test: ' +
					U.prettyPrint(err))
				else if (!res.jobID) throw new Error('JobId not found: ' +
					U.prettyPrint(res))

				IOD.status({ jobId: res.jobID }, done)
			})
		},
		itFn: function() {
			return [
				U.shouldBeSuccessful,
				U.shouldBeStatus
			]
		},
		skip: function(ActionTest) {
			return !!ActionTest.IODOpts.files ||
				!!ActionTest.shouldError
		}
	},
	{
		name: '[POST] - should have gotten status',
		beforeFn: function(IOD, ActionTest, done) {
			IOD.async(ActionTest.IODOpts, function(err, res) {
				if (err) throw new Error('Failed to get jobId for status test: ' +
					U.prettyPrint(err))
				else if (!res.jobID) throw new Error('JobId not found: ' +
					U.prettyPrint(res))

				IOD.status({
					jobId: res.jobID,
					method: 'post'
				}, done)
			})
		},
		itFn: function() {
			return [
				U.shouldBeSuccessful,
				U.shouldBeStatus
			]
		},
		skip: function(ActionTest) {
			return !!ActionTest.shouldError
		}
	}
]

