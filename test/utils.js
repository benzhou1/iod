/**
 * Unit test utilities for IOD module.
 */

'use strict';

var _ = require('lodash')
var IOD = require('../index')
var should = require('should')
var T = require('../lib/transform')

var apiKey = '<your api key>'
var host = null // override host
var port = null // override port

// New instance of IOD class.
exports.IOD = new IOD(apiKey, host, port)

/**
 * Creates an IOD object via the create method, if we haven't done so already.
 * Caches create IOD object.
 * Returns IOD as second argument to `fn`
 *
 * @param {function} fn - Function(err, IOD)
 */
exports.createIOD = function(fn) {
	if (cachedIOD) fn(null, cachedIOD)
	else {
		IOD.create(apiKey, host, port, function(err, IOD) {
			if (err) fn(err)
			else {
				cachedIOD = IOD
				fn(null, IOD)
			}
		})
	}
}

// Cached IOD for IOD objects created via create method.
var cachedIOD = null

/**
 * Common object walk paths.
 */
var commonPaths = {
	APIV1: T.walk(['VERSIONS', 'API', 'V1']),
	MAJORV1: T.walk(['VERSIONS', 'MAJOR', 'V1']),
	SENTIMENT: T.walk(['ACTIONS', 'API', 'ANALYZESENTIMENT']),
	API: T.walk(['ACTIONS', 'DISCOVERY', 'API']),
	STOREOBJ: T.walk(['ACTIONS', 'API', 'STOREOBJECT']),
	REF: T.walk(['actions', 0, 'result', 'reference'])
}

/**
 * Common RequestSchemaTests.
 */
var commonReqSchemaTests = {
	empty: function() {
		return {
			name: 'empty IODOpts',
			IODOpts: {},
			it: [ exports.shouldError ]
		}
	},
	invalidMajorVer: function() {
		return {
			name: 'invalid majorVersion',
			IODOpts: { majorVersion: 'invalid' },
			it: [
				exports.shouldError,
				_.partial(exports.shouldBeInSchemaError, 'enum', 'majorVersion')
			]
		}
	},
	invalidAction: function(IOD) {
		return {
			name: 'invalid action',
			IODOpts: {
			majorVersion: T.attempt(commonPaths.MAJORV1)(IOD),
				action: 'invalid action'
			},
			it: [
				exports.shouldError,
				_.partial(exports.shouldBeInSchemaError, 'enum', 'action')
			]
		}
	},
	invalidApiVer: function(IOD) {
		return {
			name: 'invalid apiVersion',
				IODOpts: {
				majorVersion: T.attempt(commonPaths.MAJORV1)(IOD),
				action: T.attempt(commonPaths.SENTIMENT)(IOD),
				apiVersion: 'invalid api version'
			},
			it: [
				exports.shouldError,
				_.partial(exports.shouldBeInSchemaError, 'enum', 'apiVersion')
			]
		}
	},
	invalidMethod: function(IOD) {
		return {
			name: 'invalid method',
			IODOpts: {
				majorVersion: T.attempt(commonPaths.MAJORV1)(IOD),
				action: T.attempt(commonPaths.SENTIMENT)(IOD),
				apiVersion: T.attempt(commonPaths.APIV1)(IOD),
				method: 'invalid method'
			},
			it: [
				exports.shouldError,
				_.partial(exports.shouldBeInSchemaError, 'enum', 'method')
			]
		}
	},
	invalidParams: function(IOD) {
		return {
			name: 'params not an object',
			IODOpts: {
				majorVersion: T.attempt(commonPaths.MAJORV1)(IOD),
				action: T.attempt(commonPaths.SENTIMENT)(IOD),
				apiVersion: T.attempt(commonPaths.APIV1)(IOD),
				method: 'get',
				params: 'string params'
			},
			it: [
				exports.shouldError,
				_.partial(exports.shouldBeInSchemaError, 'type', 'params')
			]
		}
	},
	invalidFiles: function(IOD) {
		return {
			name: 'files not an array',
			IODOpts: {
				majorVersion: T.attempt(commonPaths.MAJORV1)(IOD),
				action: T.attempt(commonPaths.SENTIMENT)(IOD),
				apiVersion: T.attempt(commonPaths.APIV1)(IOD),
				method: 'get',
				params: { text: '=)'},
				files: { key: 'not array' }
			},
			it: [
				exports.shouldError,
				_.partial(exports.shouldBeInSchemaError, 'type', 'files')
			]
		}
	},
	invalidJobId: function(IOD) {
		return {
			name: 'jodId not a string',
			IODOpts: {
				majorVersion: T.attempt(commonPaths.MAJORV1)(IOD),
				method: 'get',
				jobId: {}
			},
			it: [
				exports.shouldError,
				_.partial(exports.shouldBeInSchemaError, 'type', 'jobId')
			]
		}
	},
	invalidGetResults: function(IOD) {
		return {
			name: 'getResults not a boolean',
			IODOpts: {
				majorVersion: T.attempt(commonPaths.MAJORV1)(IOD),
				action: T.attempt(commonPaths.SENTIMENT)(IOD),
				apiVersion: T.attempt(commonPaths.APIV1)(IOD),
				method: 'get',
				params: { text: '=)'},
				files: ['files'],
				getResults: 'not a boolean'
			},
			it: [
				exports.shouldError,
				_.partial(exports.shouldBeInSchemaError, 'type', 'getResults')
			]
		}
	}
}

exports.paths = commonPaths
exports.reqSchemaTests = commonReqSchemaTests

/**
 * Returns stringified value `v` with 2 space separation.
 *
 * @param {*} v - Some value
 * @returns {string}
 */
exports.prettyPrint = function(v) {
	return JSON.stringify(v, null, 2)
}

/**
 * Converts a specified IOD options `IODOpts` into a new IODOpts suited for job request.
 *
 * @param {object} IODOpts - IOD options
 * @param {number} i - File name count
 * @returns {object} - Transformed IODOpts
 */
exports.createJobAction = function(IODOpts, i) {
	var action = { name: IODOpts.action }
	if (IODOpts.params) action.params =  IODOpts.params
	if (IODOpts.files) {
		action.params = action.params || {}
		action.params.file = 'file' + i
	}

	return action
}

/**
 * Sets 60 seconds as timeout for test.
 *
 * @param {object} that - this
 */
exports.timeout = function(that) {
	that.timeout(60000)
}

/**
 * Wraps a function `fn` to test that it throws.
 *
 * @param {function} fn - Function(*)
 * @returns {Function} - Function to check
 */
exports.throwFunction = function(fn) {
	var args = [].slice.call(arguments, 1)

	return (function() {
		fn.apply(null, args)
	})
}

/**
 * Done fn callback that assigned error and response to specified object under
 * specified path.
 *
 * @param {object} env - Object
 * @param {string | array} path - Object path
 * @param {function} callback - Callback()
 * @returns {Function} - Function(err, res)
 */
exports.beforeDoneFn = function(env, path, callback) {
	return function(err, res) {
		_.each(T.maybeToArray(path), function(key) {
			if (!env[key]) env[key] = {}
		})

		var endOfPath = T.walk(T.maybeToArray(path))(env)
		endOfPath.error = err
		endOfPath.response = res
		callback()
	}
}

/**
 * Given a environment object `env` look for a schema error.
 * Find a schema error where the message contains a the string `msg` and the path
 * contains the string `key`
 * Verify that specified schema error is found.
 *
 * @param {string} msg - Message to contain in schema error message
 * @param {string} key - Property to contain in schema error path
 * @param {object} env - Environment object
 * @returns {object} - env
 */
exports.shouldBeInSchemaError = function(msg, key, env) {
	var error = _.find(T.maybeToArray(env.error), function(error) {
		var message = T.attempt(T.walk(['error', 0, 'message']), error.message)(error)
		var path = T.attempt(T.walk(['error', 0, 'path']), error.path)(error)

		return _.contains(message, msg) && _.contains(path, key)
	})

	if (!error) console.log('shouldBeInSchemaError - env.error: ',
		exports.prettyPrint(env.error))
	should.exists(error)
	return env
}

/**
 * Validates that environment object `env` contains an error.
 *
 * @param {object} env - Environment object
 * @returns {object} - env
 */
exports.shouldError = function(env) {
	if (!env.error) console.log('shouldError - env: ', exports.prettyPrint(env))
	should.exists(env.error)
	return env
}

/**
 * Validates that environment object `env` does not contain an error.
 *
 * @param {object} env - Environment object
 * @returns {object} - env
 */
exports.shouldBeSuccessful = function(env) {
	if (env.error) console.log('shouldBeSuccessful - env.error: ',
		exports.prettyPrint(env.error))

	should.not.exists(env.error)
	return env
}

/**
 * Validates that environment object `env` has an error and that it contains
 * specified string `contains`
 *
 * @param {string} contains - String to contain in error
 * @param {object} env - Environment object
 * @returns {object} - env
 */
exports.shouldBeInError = function(contains, env) {
	var error = T.attempt(T.walk(['error', 0, 'error']), env.error)(env)
	var contain = _.contains(error, contains)

	if (!contain) console.log('shouldBeInError - env,error: ', env.error)
	contain.should.be.true
	return env
}

/**
 * Response should contain only jobId.
 *
 * @param {object} env - Environment object
 * @returns {object} - env
 */
exports.shouldBeJobId = function(env) {
	env.response.should.have.property('jobID')
	_.size(env.response).should.eql(1)
	return env
}

/**
 * Response should contain response from analyzesentiment.
 *
 * @param {object} env - Object
 */
exports.shouldHaveResults = function(env) {
	env.response.should.have.property('actions')
	env.response.actions.should.be.an.Array
	env.response.actions[0].should.have.property('result')
	env.response.actions[0].result.should.have
		.properties('positive', 'negative', 'aggregate')
}

/**
 * Response should contain multiple responses from analyzesentiment.
 *
 * @param {object} env - Object
 */
exports.shouldHaveMultResults = function(env) {
	env.response.should.have.property('actions')
	env.response.actions.should.be.an.Array
	_.size(env.response.actions).should.not.eql(1)

	_.each(env.response.actions, function(action) {
		action.should.have.property('result')
		action.result.should.have.properties('positive', 'negative', 'aggregate')
	})
}

/**
 * Validates that environment object `env` contains all the properties that a status
 * response should have.
 *
 * @param {object} env - Environment object
 * @returns {object} - env
 */
exports.shouldBeStatus = function(env) {
	env.response.should.have.properties('status', 'jobID', 'actions')
	env.response.actions.should.be.an.Array
	_.size(env.response.actions).should.eql(1)
	env.response.actions[0].should.have.properties('status', 'action', 'version')
	return env
}