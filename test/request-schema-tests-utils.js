'use strict';

var _ = require('lodash')
var U = require('./utils')
var T = require('../lib/transform')

module.exports = {
	/**
	 * Returns a ReqSchemaTest which should check for error when IODOpts is empty.
	 */
	empty: function() {
		return {
			name: 'empty IODOpts',
			IODOpts: {},
			it: [ U.shouldError ]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check for invalid majorVersion error.
	 */
	invalidMajorVer: function() {
		return {
			name: 'invalid majorVersion',
			IODOpts: { majorVersion: 'invalid' },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'enum', 'majorVersion')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check for invalid action error.
	 */
	invalidAction: function(IOD) {
		return {
			name: 'invalid action',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				action: 'invalid action'
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'enum', 'action')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check for invalid apiVersion error.
	 */
	invalidApiVer: function(IOD) {
		return {
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
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check for invalid method error.
	 */
	invalidMethod: function(IOD) {
		return {
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
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check for invalid params error.
	 */
	invalidParams: function(IOD) {
		return {
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
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check for invalid files error.
	 */
	invalidFiles: function(IOD) {
		return {
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
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check for invalid jobId error.
	 */
	invalidJobId: function(IOD) {
		return {
			name: 'jodId not a string',
			IODOpts: {
				majorVersion: T.attempt(U.paths.MAJORV1)(IOD),
				method: 'get',
				jobId: {}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'jobId')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check for invalid getResults error.
	 */
	invalidGetResults: function(IOD) {
		return {
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
	}
}