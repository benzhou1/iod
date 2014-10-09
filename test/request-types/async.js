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
		{
			name: 'missing action',
			IODOpts: {},
			it: [ U.shouldError ]
		},
		{
			name: 'invalid majorVersion',
			IODOpts: { majorVersion: 'invalid' },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'enum', 'majorVersion')
			]
		},
		{
			name: 'invalid action',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				action: 'invalid action'
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'enum', 'action')
			]
		},
		{
			name: 'invalid apiVersion',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				action: T.attempt(U.paths.SENTIMENT)(IOD),
				apiVersion: 'invalid api version'
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'enum', 'apiVersion')
			]
		},
		{
			name: 'invalid method',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				action: T.attempt(U.paths.SENTIMENT)(IOD),
				apiVersion: T.attempt(U.paths.APIV1)(IOD),
				method: 'invalid method'
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'enum', 'method')
			]
		},
		{
			name: 'params not an object',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				action: T.attempt(U.paths.SENTIMENT)(IOD),
				apiVersion: T.attempt(U.paths.APIV1)(IOD),
				method: 'get',
				params: 'string params'
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'params')
			]
		},
		{
			name: 'files not an array',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				action: T.attempt(U.paths.SENTIMENT)(IOD),
				apiVersion: T.attempt(U.paths.APIV1)(IOD),
				method: 'get',
				params: { text: '=)'},
				files: { key: 'not array' }
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'files')
			]
		},
		{
			name: 'getResults not a boolean',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				action: T.attempt(U.paths.SENTIMENT)(IOD),
				apiVersion: T.attempt(U.paths.APIV1)(IOD),
				method: 'get',
				params: { text: '=)'},
				files: ['files'],
				getResults: 'not a boolean'
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'getResults')
			]
		}
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
			return !!ActionTest.IODOpts.files
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