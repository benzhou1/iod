'use strict';

var _ = require('lodash')
var U = require('./utils')

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
	invalidAction: function() {
		return {
			name: 'invalid action',
			IODOpts: { action: 'invalid action' },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'enum', 'action')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check for invalid apiVersion error.
	 */
	invalidApiVer: function() {
		return {
			name: 'invalid apiVersion',
			IODOpts: { apiVersion: 'invalid api version' },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'enum', 'apiVersion')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check for invalid method error.
	 */
	invalidMethod: function() {
		return {
			name: 'invalid method',
			IODOpts: { method: 'invalid method' },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'enum', 'method')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check for invalid params error.
	 */
	invalidParams: function() {
		return {
			name: 'params not an object',
			IODOpts: { params: 'string params' },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'params')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check for invalid files error.
	 */
	invalidFiles: function() {
		return {
			name: 'files not an array',
			IODOpts: { files: { key: 'not array' } },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'files')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check for invalid jobId error.
	 */
	invalidJobId: function() {
		return {
			name: 'jodId not a string',
			IODOpts: { jobId: {} },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'jobId')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check for invalid getResults error.
	 */
	invalidGetResults: function() {
		return {
			name: 'getResults not a boolean',
			IODOpts: { getResults: 'not a boolean' },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'getResults')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check for invalid pollInterval error.
	 */
	invalidPollInterval: function() {
		return {
			name: 'pollInterval not an integer',
			IODOpts: { pollInterval: 'a string' },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'pollInterval')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check for invalid callback object.
	 */
	invalidCallbackObj: function() {
		return {
			name: 'callback not an object',
			IODOpts: { callback: ['not and object'] },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'callback')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check missing required uri property.
	 */
	emptyCallbackObj: function() {
		return {
			name: 'uri missing',
			IODOpts: { callback: {} },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'required', 'uri')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check uri property being a string.
	 */
	invalidCallbackUri: function() {
		return {
			name: 'uri not a string',
			IODOpts: { callback: { uri: {} } },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'uri')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check valid enum for method property.
	 */
	invalidCallbackMethod: function() {
		return {
			name: 'method does not match enum',
			IODOpts: { callback: { uri: 'blah', method: 'blah' } },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'enum', 'method')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check valid integer for retries property.
	 */
	invalidRetries: function() {
		return {
			name: 'retries not an integer',
			IODOpts: { retries: 'not an integer' },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'retries')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check valid array for errorCodes property.
	 */
	invalidErrorCodesArr: function() {
		return {
			name: 'errorCodes not an array',
			IODOpts: { errorCodes: { not: 'an array' } },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'errorCodes')
			]
		}
	},
	/**
	 * Returns a ReqSchemaTest which should check valid array integers for errorCodes property.
	 */
	invalidErrorCodesInt: function() {
		return {
			name: 'errorCodes array not integers',
			IODOpts: { errorCodes: ['not an integer'] },
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'errorCodes')
			]
		}
	}
}