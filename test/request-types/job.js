/**
 * Test data for job request type.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var T = require('../../lib/transform')
var RSTests = require('../request-schema-tests-utils')

/**
 * Only supports specific type of actions.
 */
exports.type = 'api'

/**
 * Returns list of Schema Tests for job request type.
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
		RSTests.invalidGetResults(),
		RSTests.invalidPollInterval(),
		RSTests.invalidCallbackObj(),
		RSTests.emptyCallbackObj(),
		RSTests.invalidCallbackUri(),
		RSTests.invalidCallbackMethod(),

		{
			name: 'missing required actions in job',
			IODOpts: {
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
				job: { actions: [
					{
						name: T.attempt(U.paths.SENTIMENT)(IOD),
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
				job: {
					actions: [
						{
							name: T.attempt(U.paths.SENTIMENT)(IOD),
							params: { text: '=)' }
						}
					]
				},
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
				job: {
					actions: [
						{
							name: T.attempt(U.paths.SENTIMENT)(IOD),
							params: { text: '=)' }
						}
					]
				},
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
				job: {
					actions: [
						{
							name: T.attempt(U.paths.SENTIMENT)(IOD),
							params: { text: '=)' }
						}
					]
				},
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
		name: '[POST] - should have results',
		beforeFn: function(IOD, ActionTest, done) {
			var IODOpts = transformIODOptsForJob(ActionTest.IODOpts)
			IODOpts.getResults = true

			IOD.job(IODOpts, done)
		},
		itFn: function(ActionTest) {
			return ActionTest.it
		},
		skip: function(ActionTest) {
			return !!ActionTest.multFiles
		}
	},
	// TODO: Allow multiple files in a job action
//	{
//		name: '[POST] - should have results from multiple files',
//		beforeFn: function(IOD, ActionTest, done) {
//			var IODOpts = IOD.IODOptsToJob(ActionTest.IODOpts, { getResults: true })
//			IOD.job(IODOpts, done)
//		},
//		itFn: function(ActionTest) {
//			return ActionTest.it
//		},
//		skip: function(ActionTest) {
//			return !ActionTest.multFiles
//		}
//	}
]

/**
 * Transform an ActionTest IODOpts into an IODOpts for job request.
 * Duplicate the action and the file if specified.
 *
 * @param {Object} IODOpts - IOD options
 * @returns {Object} Transformed IODOpts
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