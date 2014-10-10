/**
 * Test data for result request type.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var T = require('../../lib/transform')

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
		U.reqSchemaTests.invalidMethod(IOD),
		U.reqSchemaTests.invalidJobId(IOD)
	]
}

/**
 * List of result tests.
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
		name: '[GET] - should have gotten results',
		beforeFn: function(IOD, ActionTest, done) {
			IOD.async(ActionTest.IODOpts, function(err, res) {
				if (err) throw new Error('Failed to get jobId for result test: ' +
					U.prettyPrint(err))
				else if (!res.jobID) throw new Error('JobId not found: ' +
					U.prettyPrint(res))

				IOD.result({ jobId: res.jobID }, done)
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

				IOD.result({
					jobId: res.jobID,
					method: 'post'
				}, done)
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

