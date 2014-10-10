/**
 * Test data for async request type.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var T = require('../../lib/transform')

/**
 * Returns list of Schema Tests for async request type.
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
		U.reqSchemaTests.invalidApiVer(IOD),
		U.reqSchemaTests.invalidMethod(IOD),
		U.reqSchemaTests.invalidParams(IOD),
		U.reqSchemaTests.invalidFiles(IOD),
		U.reqSchemaTests.invalidGetResults(IOD)
	]
}

/**
 * List of async tests.
 * Async Tests consist of: {
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
		name: '[GET] - should have jobId',
		beforeFn: function(IOD, ActionTest, done) {
			IOD.async(ActionTest.IODOpts, done)
		},
		itFn: function(ActionTest) {
			return [
				U.shouldBeSuccessful,
				U.shouldBeJobId
			]
		},
		skip: function(ActionTest) {
			return !!ActionTest.IODOpts.files ||
				!!ActionTest.shouldError
		}
	},
	{
		name: '[POST] - should have jobId',
		beforeFn: function(IOD, ActionTest, done) {
			var IODOpts = _.defaults({ method: 'post' }, ActionTest.IODOpts)
			IOD.async(IODOpts, done)
		},
		itFn: function(ActionTest) {
			return [
				U.shouldBeSuccessful,
				U.shouldBeJobId
			]
		},
		skip: function(ActionTest) {
			return !!ActionTest.shouldError
		}
	},
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
	}
]