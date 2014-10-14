/**
 * Unit test utilities for IOD module.
 */

'use strict';

var _ = require('lodash')
var IOD = require('../index')
var should = require('should')
var T = require('../lib/transform')
var SchemaU = require('../lib/schema')

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
exports.cachedIOD = cachedIOD

// Cached reference for each action via store object
var cachedRef = {}

/**
 * Common object walk paths.
 */
var commonPaths = {
	APIV1: T.walk(['VERSIONS', 'API', 'V1']),
	MAJORV1: T.walk(['VERSIONS', 'MAJOR', 'V1']),
	SENTIMENT: T.walk(['ACTIONS', 'API', 'ANALYZESENTIMENT']),
	DETECTSENT: T.walk(['ACTIONS', 'API', 'DETECTSENTIMENT']),
	EXPANDCONT: T.walk(['ACTIONS', 'API', 'EXPANDCONTAINER']),
	EXPLODECONT: T.walk(['ACTIONS', 'API', 'EXPLODECONTAINER']),
	OCRDOC: T.walk(['ACTIONS', 'API', 'OCRDOCUMENT']),
	OCR: T.walk(['ACTIONS', 'API', 'OCR']),
	VIEWDOC: T.walk(['ACTIONS', 'API', 'VIEWDOCUMENT']),
	VIEW: T.walk(['ACTIONS', 'API', 'VIEW']),
	EXTRACTTEXT: T.walk(['ACTIONS', 'API', 'EXTRACTTEXT']),
	RECBAR: T.walk(['ACTIONS', 'API', 'RECOGNIZEBARCODES']),
	READBAR: T.walk(['ACTIONS', 'API', 'READBARCODE']),
	DETFACE: T.walk(['ACTIONS', 'API', 'DETECTFACES']),
	FINDFACE: T.walk(['ACTIONS', 'API', 'FINDFACES']),
	RECIMAGE: T.walk(['ACTIONS', 'API', 'RECOGNIZEIMAGES']),
	DETIMAGE: T.walk(['ACTIONS', 'API', 'DETECTIMAGE']),
	FINDSIM: T.walk(['ACTIONS', 'API', 'FINDSIMILAR']),
	FRC: T.walk(['ACTIONS', 'API', 'FINDRELATEDCONCEPTS']),
	DT: T.walk(['ACTIONS', 'API', 'DYNAMICTHESAURUS']),
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
 * Returns a ActionSchemaTest which should check for a no required inputs error.
 *
 * @param {IOD} IOD - IOD object
 * @param {string} path - commonPaths name
 * @param {string} action - IOD action name
 * @returns {object} - ActionSchemaTest
 */
exports.noInputs = function(IOD, path, action) {
	return {
		name: 'no inputs',
		IODOpts: {
			action: T.attempt(commonPaths[path], action)(IOD)
		},
		it: [
			exports.shouldError,
			_.partial(exports.shouldBeInError, 'inputs')
		]
	}
}

/**
 * Returns a ActionSchemaTest which should check for a invalid string type error.
 *
 * @param {IOD} IOD - IOD object
 * @param {string} paramName - Action parameter name
 * @param {string} path - commonPaths name
 * @param {string} action - IOD action name
 * @returns {object} - ActionSchemaTest
 */
exports.invalidStringType = function(IOD, paramName, path, action) {
	return {
		name: 'invalid string for ' + paramName,
		IODOpts: {
			action: T.attempt(commonPaths[path], action)(IOD),
			params: T.maplet(paramName)([1, 2, 3])
		},
		it: [
			exports.shouldError,
			_.partial(exports.shouldBeInSchemaError, 'type', paramName)
		]
	}
}

/**
 * Returns a ActionSchemaTest which should check for a invalid enum value error.
 *
 * @param {IOD} IOD - IOD object
 * @param {string} paramName - Action parameter name
 * @param {string} path - commonPaths name
 * @param {string} action - IOD action name
 * @returns {object} - ActionSchemaTest
 */
exports.invalidEnumValue = function(IOD, paramName, path, action) {
	return {
		name: 'invalid enum for ' + paramName,
		IODOpts: {
			action: T.attempt(commonPaths[path], action)(IOD),
			params: T.maplet(paramName)('invalid enum')
		},
		it: [
			exports.shouldError,
			_.partial(exports.shouldBeInSchemaError, 'enum', paramName)
		]
	}
}

/**
 * Returns a ActionSchemaTest which should check for a invalid bollean type error.
 *
 * @param {IOD} IOD - IOD object
 * @param {string} paramName - Action parameter name
 * @param {string} path - commonPaths name
 * @param {string} action - IOD action name
 * @returns {object} - ActionSchemaTest
 */
exports.invalidBooleanType = function(IOD, paramName, path, action) {
	return {
		name: 'invalid boolean for ' + paramName,
		IODOpts: {
			action: T.attempt(commonPaths[path], action)(IOD),
			params: T.maplet(paramName)('invalid boolean')
		},
		it: [
			exports.shouldError,
			_.partial(exports.shouldBeInSchemaError, 'type', paramName)
		]
	}
}

/**
 * Returns a ActionSchemaTest which should check for a invalid number type error.
 *
 * @param {IOD} IOD - IOD object
 * @param {string} paramName - Action parameter name
 * @param {string} path - commonPaths name
 * @param {string} action - IOD action name
 * @returns {object} - ActionSchemaTest
 */
exports.invalidNumberType = function(IOD, paramName, path, action) {
	return {
		name: 'invalid number for ' + paramName,
		IODOpts: {
			action: T.attempt(commonPaths[path], action)(IOD),
			params: T.maplet(paramName)('invalid number')
		},
		it: [
			exports.shouldError,
			_.partial(exports.shouldBeInSchemaError, 'type', paramName)
		]
	}
}

/**
 * Returns a ActionSchemaTest which should check for a below minimum error.
 *
 * @param {IOD} IOD - IOD object
 * @param {string} paramName - Action parameter name
 * @param {string} path - commonPaths name
 * @param {string} action - IOD action name
 * @returns {object} - ActionSchemaTest
 */
exports.invalidMinimum = function(IOD, paramName, min, path, action) {
	return {
		name: min + ' for ' + paramName,
		IODOpts: {
			action: T.attempt(commonPaths[path], action)(IOD),
			params: T.maplet(paramName)(min)
		},
		it: [
			exports.shouldError,
			_.partial(exports.shouldBeInSchemaError, 'minimum', paramName)
		]
	}
}

/**
 * Returns a ActionSchemaTest which should check for a invalid array string type error.
 *
 * @param {IOD} IOD - IOD object
 * @param {string} paramName - Action parameter name
 * @param {string} path - commonPaths name
 * @param {string} action - IOD action name
 * @returns {object} - ActionSchemaTest
 */
exports.invalidArrayString = function(IOD, paramName, path, action) {
	return {
		name: 'invalid array for ' + paramName,
		IODOpts: {
			action: T.attempt(commonPaths[path], action)(IOD),
			params: T.maplet(paramName)({ key: 'not array of strings' })
		},
		it: [
			exports.shouldError,
			_.partial(exports.shouldBeInSchemaError, 'type', paramName)
		]
	}
}

/**
 * Returns a ActionSchemaTest which should check for a invalid array object type error.
 *
 * @param {IOD} IOD - IOD object
 * @param {string} paramName - Action parameter name
 * @param {string} path - commonPaths name
 * @param {string} action - IOD action name
 * @returns {object} - ActionSchemaTest
 */
exports.invalidArrayObj = function(IOD, paramName, path, action) {
	return {
		name: 'invalid array for ' + paramName,
		IODOpts: {
			action: T.attempt(commonPaths[path], action)(IOD),
			params: T.maplet(paramName)('not array of objects')
		},
		it: [
			exports.shouldError,
			_.partial(exports.shouldBeInSchemaError, 'type', paramName)
		]
	}
}

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
	if (IODOpts.params) action.params = IODOpts.params
	if (IODOpts.files) {
		action.params = action.params || {}
		action.params = _.defaults({ file: 'file' + i }, action.params)
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
 * Response should match response schema for specified `action`.
 * If response is from job, apply schema validation for every action result.
 *
 * @param {string} action - Action name
 * @param {object} env - Environment object
 */
exports.shouldHaveResults = function(action, env) {
	var jobActionResults = env.response.actions
	var shouldMatchResSchema = function(result) {
		var errors = SchemaU.validateWithPrettyErr(cachedIOD, action + '.response',
			result)

		if (errors) {
			console.log('Results did not match ' + action +
				'\'s response schema: ', exports.prettyPrint(errors))
			console.log('Results: ', exports.prettyPrint(result))
			console.log('Response: ', exports.prettyPrint(env.response))
		}

		should.not.exist(errors)
		return errors
	}

	if (jobActionResults) {
		_.each(jobActionResults, function(actionRes) {
			if (shouldMatchResSchema(actionRes.result)) return false
		})
	}
	else shouldMatchResSchema(env.response)
	return env
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

/**
 * Given a file path `filePath` store file in IDOL onDemand via storeobject action.
 * Cached reference from results.
 * Return cached if available.
 *
 * @param {IOD} IOD - IOD object
 * @param {string} action - Action name
 * @param {string} filePath - Path to file to store
 * @param {function} done - Done(reference)
 * @throws {Error} - If error on storeobject action
 * @throws {Error} - If couldn't find reference in results
 */
exports.prepareReference = function(IOD, action, filePath, done) {
	if (cachedRef[action]) return done(cachedRef[action])

	var IODOpts = {
		action: T.attempt(commonPaths.STOREOBJ, 'storeobject')(IOD),
		files: [filePath],
		getResults: true
	}
	IOD.async(IODOpts, function(err, res) {
		if (err) throw new Error('Failed to prepare for tests: ' +
			exports.prettyPrint(err))
		else {
			var ref = T.attempt(commonPaths.REF)(res)
			if (!ref) throw new Error('Could not find reference from storeobject: ' +
				exports.prettyPrint(res))

			done(ref)
		}
	})
}