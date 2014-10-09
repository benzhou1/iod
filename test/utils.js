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

/**
 * Sets 60 seconds as timeout for test.
 *
 * @param {object} that - this
 */
exports.timeout = function(that) {
	that.timeout(60000)
}

var cachedIOD = null

exports.paths = {
	APIV1: T.walk(['VERSIONS', 'API', 'V1']),
	MAJORV1: T.walk(['VERSIONS', 'MAJOR', 'V1']),
	SENTIMENT: T.walk(['ACTIONS', 'API', 'ANALYZESENTIMENT']),
	STOREOBJ: T.walk(['ACTIONS', 'API', 'STOREOBJECT'])
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

/**
 * Look through array of errors and find one that contains specified message and
 * contains specified path.
 *
 * @param {array} errors - List of errors
 * @param {string} msg - Message
 * @param {string} key - Key in path
 */
exports.shouldBeInSchemaError = function(msg, key, env) {
	var errors = env.error
	var error = _.find(T.maybeToArray(errors), function(error) {
		return _.contains(error.message, msg) &&
			_.contains(error.path, key)
	})

	if (!error) console.log('findSchemaMsgError - env.error: ', JSON.stringify(env.error,  null, 2))
	should.exists(error)
	return env
}

/**
 * Should contain error and no response
 *
 * @param {object} env - Object
 */
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

/**
 * Should contain no errors in response and should contain no errors.
 *
 * @param {object} env - Object
 */
exports.shouldBeSuccessful = function(env) {
	if (env.error) console.log('shouldBeSuccessful - env.error: ',
		JSON.stringify(env.error, null, 2))

	should.not.exists(env.error)
	return env
}

/**
 * Specified string should contain other string.
 *
 * @param {string} str - String
 * @param {string} contains - Other string
 */
exports.shouldBeInError = function(contains, env) {
	var contain = _.contains(env.error, contains)

	if (!contain) console.log('shouldContain - env,error: ', env.error)
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

/**
 * Response should be a status, not result.
 *
 * @param {object} env - Object
 */
exports.shouldBeStatus = function(env) {
	env.response.should.have.property('actions')
	env.response.actions.should.be.an.Array
	env.response.actions[0].should.have
		.properties('status', 'action', 'version')
}