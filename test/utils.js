/**
 * Unit test utilities for IOD module.
 */

'use strict';

var _ = require('lodash')
var IOD = require('../index')
var should = require('should')
var T = require('../lib/transform')
var SchemaU = require('../lib/schema')

// TODO: pass in these as command line args
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
 * @param {Function} fn - Function(err, IOD)
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
	GETCONT: T.walk(['ACTIONS', 'API', 'GETCONTENT']),
	FRC: T.walk(['ACTIONS', 'API', 'FINDRELATEDCONCEPTS']),
	DT: T.walk(['ACTIONS', 'API', 'DYNAMICTHESAURUS']),
	GPV: T.walk(['ACTIONS', 'API', 'GETPARAMETRICVALUES']),
	QTI: T.walk(['ACTIONS', 'API', 'QUERYTEXTINDEX']),
	QUERY: T.walk(['ACTIONS', 'API', 'QUERY']),
	CATDOC: T.walk(['ACTIONS', 'API', 'CATEGORIZEDOCUMENT']),
	EENTITIES: T.walk(['ACTIONS', 'API', 'EXTRACTENTITIES']),
	EENTITY: T.walk(['ACTIONS', 'API', 'EXTRACTENTITY']),
	EXPANDTERMS: T.walk(['ACTIONS', 'API', 'EXPANDTERMS']),
	EXPANDTERM: T.walk(['ACTIONS', 'API', 'EXPANDTERM']),
	HLTEXT: T.walk(['ACTIONS', 'API', 'HIGHLIGHTTEXT']),
	HL: T.walk(['ACTIONS', 'API', 'HIGHLIGHT']),
	IDLANG: T.walk(['ACTIONS', 'API', 'IDENTIFYLANGUAGE']),
	DETLANG: T.walk(['ACTIONS', 'API', 'DETECTLANGUAGE']),
	TOKENTEXT: T.walk(['ACTIONS', 'API', 'TOKENIZETEXT']),
	TOKEN: T.walk(['ACTIONS', 'API', 'TOKENIZE']),
	API: T.walk(['ACTIONS', 'DISCOVERY', 'API']),
	STOREOBJ: T.walk(['ACTIONS', 'API', 'STOREOBJECT']),
	CREATETI: T.walk(['ACTIONS', 'API', 'CREATETEXTINDEX']),
	LISTI: T.walk(['ACTIONS', 'API', 'LISTINDEXES']),
	DELETETI: T.walk(['ACTIONS', 'API', 'DELETETEXTINDEX']),
	ADDTOTI: T.walk(['ACTIONS', 'API', 'ADDTOTEXTINDEX']),
	DELFROMTI: T.walk(['ACTIONS', 'API', 'DELETEFROMTEXTINDEX']),
	INDEXSTATUS: T.walk(['ACTIONS', 'API', 'INDEXSTATUS']),
	REF: T.walk(['actions', 0, 'result', 'reference'])
}

/**
 * Common RequestSchemaTests.
 */
var commonReqSchemaTests = {
	/**
	 * Returns a ReqSchemaTest which should check for error when IODOpts is empty.
	 */
	empty: function() {
		return {
			name: 'empty IODOpts',
			IODOpts: {},
			it: [ exports.shouldError ]
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
				exports.shouldError,
				_.partial(exports.shouldBeInSchemaError, 'enum', 'majorVersion')
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
			majorVersion: T.attempt(commonPaths.MAJORV1)(IOD),
				action: 'invalid action'
			},
			it: [
				exports.shouldError,
				_.partial(exports.shouldBeInSchemaError, 'enum', 'action')
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
	/**
	 * Returns a ReqSchemaTest which should check for invalid method error.
	 */
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
	/**
	 * Returns a ReqSchemaTest which should check for invalid params error.
	 */
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
	/**
	 * Returns a ReqSchemaTest which should check for invalid files error.
	 */
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
	/**
	 * Returns a ReqSchemaTest which should check for invalid jobId error.
	 */
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
	/**
	 * Returns a ReqSchemaTest which should check for invalid getResults error.
	 */
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

var commonActionSchemTests = {
	/**
	 * Returns a ActionSchemaTest which should check for a required parameter error.
	 */
	missingRequired: function(IOD, paramName, path, action) {
		return {
			name: 'missing required parameter ' + paramName,
			IODOpts: {
				action: T.attempt(commonPaths[path], action)(IOD),
				params: {
					text: 'some text',
					url: 'some url',
					json: 'some json'
				},
				files: ['some file']
			},
			it: [
				exports.shouldError,
				_.partial(exports.shouldBeInSchemaError, 'required', paramName)
			]
		}
	},
	/**
	 * Returns a ActionSchemaTest which should check for a no required inputs error.
	 */
	noInputs: function(IOD, path, action, required) {
		return {
			name: 'no inputs',
			IODOpts: {
				action: T.attempt(commonPaths[path], action)(IOD),
				params: required || {}
			},
			it: [
				exports.shouldError,
				_.partial(exports.shouldBeInError, 'inputs')
			]
		}
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid string type error.
	 */
	invalidStringType: function(IOD, paramName, path, action) {
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
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid enum value error.
	 */
	invalidEnumValue: function(IOD, paramName, path, action) {
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
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid bollean type error.
	 */
	invalidBooleanType: function(IOD, paramName, path, action) {
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
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid number type error.
	 */
	invalidNumberType: function(IOD, paramName, path, action) {
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
	},
	/**
	 * Returns a ActionSchemaTest which should check for a below minimum error.
	 */
	invalidMinimum: function(IOD, paramName, min, path, action) {
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
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid array string type error.
	 */
	invalidArrayString: function(IOD, paramName, path, action) {
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
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid array object type error.
	 */
	invalidArrayObj: function(IOD, paramName, path, action) {
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
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid pairs between file
	 * and additional_metadata.
	 */
	uneqlFileAddMeta: function(IOD, filePath, path, action, required) {
		return {
			name: 'unequal pair length file-additional_metadata',
			IODOpts: {
				action: T.attempt(commonPaths[path], action)(IOD),
				params: _.defaults(required || {}, {
					additional_metadata: [
						{ addMeta: 'addMeta' },
						{ addMeta: 'addMeta' }
					]
				}),
				files: [filePath, filePath, filePath]
			},
			it: [
				exports.shouldError,
				_.partial(exports.shouldBeInError, 'pairs')
			]
		}
	},
	/**
	 * Returns a ActionSchemaTest which should check for a invalid pairs between file
	 * and reference_prefix.
	 */
	uneqlFileRefPref: function(IOD, filePath, path, action, required) {
		return {
			name: 'unequal pair length file-reference_prefix',
			IODOpts: {
				action: T.attempt(commonPaths[path], action)(IOD),
				params: _.defaults(required || {}, {
					reference_prefix: ['prefix', 'prefix']
				}),
				files: [filePath, filePath, filePath]
			},
			it: [
				exports.shouldError,
				_.partial(exports.shouldBeInError, 'pairs')
			]
		}
	}
}

var commonPrepare = {
	/**
	 * Given a file path `filePath` store file in IDOL onDemand via storeobject action.
	 * Cached reference from results.
	 * Return cached if available.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {String} action - Action name
	 * @param {String} filePath - Path to file to store
	 * @param {Function} done - Done(reference)
	 * @throws {Error} - If error on storeobject action
	 * @throws {Error} - If couldn't find reference in results
	 */
	reference: function(IOD, action, filePath, done) {
		if (action !== 'nocache' && cachedRef[action]) return done(null, cachedRef[action])
		else commonIODReq.storeObject(IOD, filePath, function(err, ref) {
			cachedRef[action] = ref
			done(null, ref)
		})
	},

	textIndex: function(IOD, done) {
		commonIODReq.listIndexes(IOD, function(err, indexes) {
			var testIndex = _.find(indexes.index, function(index) {
				return index.index === 'test'
			})
			if (testIndex) done()
			else commonIODReq.createIndex(IOD, done)
		})
	}
}

var commonIODReq = {
	storeObject: function(IOD, filePath, callback) {
		var IODOpts = {
			action: T.attempt(commonPaths.STOREOBJ, 'storeobject')(IOD),
			files: [filePath],
			getResults: true
		}
		IOD.sync(IODOpts, function(err, res) {
			if (err) throw new Error('Failed to store object: ' +
				exports.prettyPrint(err))
			else {
				if (!res || !res.reference) {
					throw new Error('Could not find reference from storeobject: ' +
						exports.prettyPrint(res))
				}

				callback(null, res.reference)
			}
		})
	},

	// TODO: switch to listresources
	listIndexes: function(IOD, callback) {
		var IODOpts = {
			action: T.attempt(commonPaths.LISTI, 'listindexes')(IOD),
			params: {
				type: 'content',
				flavor: 'explorer'
			}
		}
		IOD.sync(IODOpts, function(err, res) {
			if (err) throw new Error('Failed to get list of indexes: ' +
				exports.prettyPrint(err))
			else if (!res || !res.index) throw new Error('List of user indexes not found: ' +
				exports.prettyPrint(res))
			else callback(null, res)
		})
	},

	createIndex: function(IOD, callback) {
		var IODOpts = {
			action: T.attempt(commonPaths.CREATETI, 'createtextindex')(IOD),
			params: {
				index: 'test'
			}
		}
		IOD.sync(IODOpts, function(err, res) {
			if (err) throw new Error('Failed to create test index: ' +
				exports.prettyPrint(err))
			else if (!res || res.message !== 'index created') {
				throw new Error('Test index was not created successfully: ' +
					exports.prettyPrint(res))
			}
			else callback(null, res)
		})
	}
}

exports.paths = commonPaths
exports.reqSchemaTests = commonReqSchemaTests
exports.actSchemaTests = commonActionSchemTests
exports.prepare = commonPrepare
exports.IODReq = commonIODReq

/**
 * Returns stringified value `v` with 2 space separation.
 *
 * @param {*} v - Some value
 * @returns {String}
 */
exports.prettyPrint = function(v) {
	return JSON.stringify(v, null, 2)
}

/**
 * Converts a specified IOD options `IODOpts` into a new IODOpts suited for job request.
 *
 * @param {Object} IODOpts - IOD options
 * @param {Number} i - File name count
 * @returns {Object} - Transformed IODOpts
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
 * @param {Object} that - this
 */
exports.timeout = function(that) {
	that.timeout(60000)
}

/**
 * Wraps a function `fn` to test that it throws.
 *
 * @param {Function} fn - Function(*)
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
 * @param {Object} env - Object
 * @param {string | array} path - Object path
 * @param {Function} callback - Callback()
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
 * @param {String} msg - Message to contain in schema error message
 * @param {String} key - Property to contain in schema error path
 * @param {Object} env - Environment object
 * @returns {Object} - env
 */
exports.shouldBeInSchemaError = function(msg, key, env) {
	var error = _.find(T.maybeToArray(env.error), function(error) {
		if (error.action) {
			return _.find(error.error, function(jobErr) {
				return _.contains(jobErr.message, msg) && _.contains(jobErr.path, key)
			})
		}
		else return _.contains(error.message, msg) && _.contains(error.path, key)
	})

	if (!error) console.log('shouldBeInSchemaError - env.error: ',
		exports.prettyPrint(env.error))

	should.exists(error)
	return env
}

/**
 * Validates that environment object `env` contains an error.
 *
 * @param {Object} env - Environment object
 * @returns {Object} - env
 */
exports.shouldError = function(env) {
	if (!env.error) console.log('shouldError - env: ', exports.prettyPrint(env))
	should.exists(env.error)
	return env
}

/**
 * Validates that environment object `env` does not contain an error.
 *
 * @param {Object} env - Environment object
 * @returns {Object} - env
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
 * @param {String} contains - String to contain in error
 * @param {Object} env - Environment object
 * @returns {Object} - env
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
 * @param {Object} env - Environment object
 * @returns {Object} - env
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
 * @param {String} action - Action name
 * @param {Object} env - Environment object
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
 * @param {Object} env - Environment object
 * @returns {Object} - env
 */
exports.shouldBeStatus = function(env) {
	env.response.should.have.properties('status', 'jobID', 'actions')
	env.response.actions.should.be.an.Array
	_.size(env.response.actions).should.eql(1)
	env.response.actions[0].should.have.properties('status', 'action', 'version')
	return env
}

exports.shouldBeDeleted = function(env) {
	var deleted = env.response.deleted
	if (deleted !== true) console.log('Did not delete index successfully: ',
		exports.prettyPrint(env.response))
	deleted.should.be.true
	return env
}

exports.shouldBeConfirm = function(env) {
	var confirm = env.response.confirm
	if (!confirm) console.log('Confirm not found in response: ',
		exports.prettyPrint(env.response))
	should.exists(confirm)
	return env
}

exports.deleteTextIndex = function(IOD, index, confirm, callback) {
	var IODOpts = {
		action: T.attempt(commonPaths.DELETETI, 'deletetextindex')(IOD),
		params: {
			index: index,
			confirm: confirm
		}
	}
	IOD.sync(IODOpts, function(err, res) {
		if (err) throw new Error('Failed to delete text index: ' +
			exports.prettyPrint(err))
		else if (confirm && (!res || !res.deleted || res.deleted !== true)) {
			throw new Error('Failed to deleted text index: ' + exports.prettyPrint(res))
		}
		else if (!confirm && (!res || !res.confirm)) {
			throw new Error('Failed to get confirmation: ' + exports.prettyPrint(res))
		}
		else callback(null, confirm ? null : res.confirm)
	})
}

exports.forceDeleteTextIndex = function(IOD, index, callback) {
	exports.deleteTextIndex(IOD, index, null, function(err, confirm) {
		exports.deleteTextIndex(IOD, index, confirm, callback)
	})
}