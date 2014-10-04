/**
 * Unit test utilities for IOD module.
 */

'use strict';

var _ = require('lodash')
var IOD = require('../index')
var should = require('should')
var T = require('../lib/transform')
var async = require('../lib/async-ext')

/**
 * Array of different tests.
 * Replace with your own api key to test.
 */
var tests = [
	{
		test: 'Http',
		apiKey: '<your own api key>',
		host: 'http://api.idolondemand.com',
		port: 80
	},
	{
		test: 'Https',
		apiKey: '<your own api key>',
		host: 'https://api.idolondemand.com',
		port: 443
	}
]

exports.tests = tests

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
exports.createIOD = function(testIndex, env, callback) {
	var setIOD = function(err, IOD) {
		env.IOD = IOD
		env.err = err
		callback()
	}

	var test = tests[testIndex]
	var cachedIOD = test.IOD

	if (cachedIOD) setIOD(null, cachedIOD)
	else {
		IOD.create(test.apiKey, test.host, test.port,
			async.split(function(IOD) {
				test.IOD = IOD
				setIOD(null, IOD)
			}, callback)
		)
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
exports.findSchemaMsgError = function(errors, msg, key) {
	var error = _.find(T.maybeToArray(errors), function(error) {
		return _.contains(error.message, msg) &&
			_.contains(error.path, key)
	})
	should.exists(error)
}

/**
 * Should contain error and no response
 *
 * @param {object} env - Object
 */
exports.shouldError = function(env) {
	should.exists(env.error)
	should.not.exists(env.response)
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
	var error = exports.findErrorInRes(env.response)

	should.exists(env.response)
	should.not.exists(env.error)
	error.should.be.false
}

/**
 * Specified string should contain other string.
 *
 * @param {string} str - String
 * @param {string} contains - Other string
 */
exports.shouldContain = function(str, contains) {
	_.contains(str, contains).should.be.true
}

/**
 * Response should contain only jobId.
 *
 * @param {object} env - Object
 */
exports.shouldBeJobId = function(env) {
	env.response.should.have.property('jobID')
	_.size(env.response).should.eql(1)
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