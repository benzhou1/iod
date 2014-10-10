/**
 * Unit test utilities for IOD module.
 */

'use strict';

var _ = require('lodash')
var IOD = require('../index')
var should = require('should')
var T = require('../lib/transform')
var async = require('../lib/async-ext')

var apiKey = '6ee6cbee-f94b-4688-a697-259fd8545d94'

exports.tests = []



var cachedIOD = null

var commonPaths = {
	APIV1: T.walk(['VERSIONS', 'API', 'V1']),
	MAJORV1: T.walk(['VERSIONS', 'MAJOR', 'V1']),
	SENTIMENT: T.walk(['ACTIONS', 'API', 'ANALYZESENTIMENT']),
	STOREOBJ: T.walk(['ACTIONS', 'API', 'STOREOBJECT']),
	REF: T.walk(['actions', 0, 'result', 'reference'])
}

var commonReqSchemaTests = {
	empty: function(IOD) {
		return {
			name: 'empty IODOpts',
			IODOpts: {},
			it: [ exports.shouldError ]
		}
	},
	invalidMajorVer: function(IOD) {
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
 * Sets 60 seconds as timeout for test.
 *
 * @param {object} that - this
 */
exports.timeout = function(that) {
	that.timeout(60000)
}

/**
 * Creates an IOD object given `testIndex` which maps to one of the tests
 * shown above.
 * If IOD object is already created for that test just returned the cached IOD
 * object.
 * IOD object is assigned to `env` object in place.
 *
 * @param {number} testIndex - Test index
 * @param {object} env - Environment object
 * @param {function} callback - Callback(err | null)
 */
exports.createIOD = function(fn) {
	if (cachedIOD) fn(null, cachedIOD)
	else {
		IOD.create(apiKey, function(err, IOD) {
			if (err) fn(err)
			else {
				cachedIOD = IOD
				fn(null, IOD)
			}
		})
	}
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


exports.shouldBeInSchemaError = function(msg, key, env) {
	var error = _.find(T.maybeToArray(env.error), function(error) {
		var message = T.attempt(T.walk(['error', 0, 'message']), error.message)(error)
		var path = T.attempt(T.walk(['error', 0, 'path']), error.path)(error)

		return _.contains(message, msg) && _.contains(path, key)
	})

	if (!error) console.log('shouldBeInSchemaError - env.error: ',
		JSON.stringify(env.error,  null, 2))
	should.exists(error)
	return env
}


exports.shouldError = function(env) {
	if (!env.error) console.log('shouldError - env: ', JSON.stringify(env,  null, 2))
	should.exists(env.error)
	return env
}

/**
 * Recursively traverse though every key in IOD response until an error is found.
 *
 * @param {object} res - IOD response
 * @returns {boolean} - Found
 */
exports.findErrorInRes = function(res) {
	if (!res || !_.isObject(res) || _.isEmpty(res)) return false
	else if (res.error != null) return true
	else {
		return _.some(res, function(val, key) {
			return exports.findErrorInRes(res[key])
		})
	}
}


exports.shouldBeSuccessful = function(env) {
	if (env.error) console.log('shouldBeSuccessful - env.error: ',
		JSON.stringify(env.error, null, 2))

	should.not.exists(env.error)
	return env
}


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
 * @param {object} env - Object
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


exports.shouldBeStatus = function(env) {
	env.response.should.have.properties('status', 'jobID', 'actions')
	env.response.actions.should.be.an.Array
	_.size(env.response.actions).should.eql(1)
	env.response.actions[0].should.have.properties('status', 'action', 'version')
	return env
}