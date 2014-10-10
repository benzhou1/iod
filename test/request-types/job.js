/**
 * Test data for job request type.
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
 * Returns list of Schema Tests for job request type.
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
		U.reqSchemaTests.invalidGetResults(IOD),

		{
			name: 'missing required actions in job',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				job: {}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'required', 'actions')
			]
		},
		{
			name: 'actions for job is not an array',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				job: { actions: 'not an array' }
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'actions')
			]
		},
		{
			name: 'invalid action name in job',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				job: { actions: [{ name: 'invalid action' }] }
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'enum', 'name')
			]
		},
		{
			name: 'invalid version name in job',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				job: { actions: [
					{
						name: T.attempt(U.paths.SENTIMENT)(IOD),
						version: 'invalid version'
					}
				] }
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'enum', 'version')
			]
		},
		{
			name: 'params in job is not an object',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				job: { actions: [
					{
						name: T.attempt(U.paths.SENTIMENT)(IOD),
						version: T.attempt(U.paths.APIV1)(IOD),
						params: 'not an object'
					}
				] }
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'params')
			]
		},
		{
			name: 'empty object for files array in job',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				job: {
					actions: [
						{
							name: T.attempt(U.paths.SENTIMENT)(IOD),
							version: T.attempt(U.paths.APIV1)(IOD),
							params: { text: '=)' }
						}
					]
				},
				getResults: false,
				files: [{}]
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'required', 'name')
			]
		},
		{
			name: 'name for object in files array in job not a string',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				job: {
					actions: [
						{
							name: T.attempt(U.paths.SENTIMENT)(IOD),
							version: T.attempt(U.paths.APIV1)(IOD),
							params: { text: '=)' }
						}
					]
				},
				getResults: false,
				files: [{ name: {} }]
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'name')
			]
		},
		{
			name: 'path for object in files array in job not a string',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				job: {
					actions: [
						{
							name: T.attempt(U.paths.SENTIMENT)(IOD),
							version: T.attempt(U.paths.APIV1)(IOD),
							params: { text: '=)' }
						}
					]
				},
				getResults: false,
				files: [{ name: 'filename', path: {} }]
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'path')
			]
		}
	]
}

/**
 * List of job tests.
 * Job Tests consist of: {
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
		name: '[POST] - should have jobId',
		beforeFn: function(IOD, ActionTest, done) {
			var IODOpts = transformIODOptsForJob(ActionTest.IODOpts)
			IOD.job(IODOpts, done)
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
		name: '[POST] - should have results',
		beforeFn: function(IOD, ActionTest, done) {
			var IODOpts = transformIODOptsForJob(ActionTest.IODOpts)
			IODOpts.getResults = true

			IOD.job(IODOpts, done)
		},
		itFn: function(ActionTest) {
			return ActionTest.it
		}
	}
]

/**
 * Transform an ActionTest IODOpts into an IODOpts for job request.
 * Duplicate the action and the file if specified.
 *
 * @param {object} IODOpts - IOD options
 * @returns {object} Transformed IODOpts
 */
function transformIODOptsForJob(IODOpts) {
	var opts = {
		job: {
			actions: [
				U.createJobAction(IODOpts, 1),
				U.createJobAction(IODOpts, 2)
			]
		}
	}
	if (IODOpts.files) {
		opts.files = [
			{ name: 'file1', path: IODOpts.files[0] },
			{ name: 'file2', path: IODOpts.files[0] + '2' }
		]
	}
	return opts
}