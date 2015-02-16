/**
 * Unit test utilities for IOD module.
 */

'use strict';

var _ = require('lodash')
var IOD = require('../index')
var should = require('should')
var T = require('../lib/transform')
var SchemaU = require('../lib/schema')
var config = require('./config_defaults')

try {
	// To override default config, create a config.js file
	var overrideCfg = require('./config')
	config = _.defaults({}, overrideCfg, config)
}
// No config.js file found
catch(e) {}

// Extract configuration parameters from config
var apiKey = config.apiKey
var host = config.host
var port = config.port
var timeout = config.timeout
var testCon = exports.testCon = config.testCon
var testIndex = exports.testIndex = config.testIndex
var testStore = exports.testStore = config.testStore
exports.testUser = config.testUser
exports.testRole = config.testRole
exports.testPass = config.testPass
exports.testServiceName = config.testServiceName

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
			if (err) throw Error('Failed to create IOD object: ' + err)
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
var commonPaths = exports.paths = {
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
	LISTR: T.walk(['ACTIONS', 'API', 'LISTRESOURCES']),
	DELETETI: T.walk(['ACTIONS', 'API', 'DELETETEXTINDEX']),
	ADDTOTI: T.walk(['ACTIONS', 'API', 'ADDTOTEXTINDEX']),
	DELFROMTI: T.walk(['ACTIONS', 'API', 'DELETEFROMTEXTINDEX']),
	INDEXSTATUS: T.walk(['ACTIONS', 'API', 'INDEXSTATUS']),
	REF: T.walk(['actions', 0, 'result', 'reference']),
	RECSPEECH: T.walk(['actions', 0, 'result', 'RECOGNIZESPEECH']),
	RETRIEVEIF: T.walk(['actions', 0, 'result', 'RETRIEVEINDEXFIELDS']),
	EXTRACTC: T.walk(['actions', 0, 'result', 'EXTRACTCONCEPTS']),
	ADDSTORE: T.walk(['actions', 0, 'result', 'ADDSTORE']),
	ADDUSER: T.walk(['actions', 0, 'result', 'ADDUSER']),
	ADDROLE: T.walk(['actions', 0, 'result', 'ADDROLE']),
	LISTSTORE: T.walk(['actions', 0, 'result', 'LISTSTORES']),
	LISTUSER: T.walk(['actions', 0, 'result', 'LISTUSERS']),
	LISTROLES: T.walk(['actions', 0, 'result', 'LISTROLES']),
	DELSTORE: T.walk(['actions', 0, 'result', 'DELETESTORE']),
	DELUSER: T.walk(['actions', 0, 'result', 'DELETEUSER']),
	DELROLE: T.walk(['actions', 0, 'result', 'DELROLE']),
	AUTH: T.walk(['actions', 0, 'result', 'AUTHENTICATE']),
	ASSIGNROLE: T.walk(['actions', 0, 'result', 'ASSIGNROLE']),
	UNASSIGNROLE: T.walk(['actions', 0, 'result', 'UNASSIGNROLE']),
	CONSTATUS: T.walk(['actions', 0, 'result', 'CONNECTORSTATUS']),
	CREATECON: T.walk(['actions', 0, 'result', 'CREATECONNECTOR']),
	DELCON: T.walk(['actions', 0, 'result', 'DELETECONNECTOR']),
	RETRIEVECON: T.walk(['actions', 0, 'result', 'RETRIEVECONFIG']),
	STARTCON: T.walk(['actions', 0, 'result', 'STARTCONNECTOR']),
	UPDATECON: T.walk(['actions', 0, 'result', 'UPDATECONNECTOR']),
	CONHISTORY: T.walk(['actions', 0, 'result', 'CONNECTORHISTORY']),
	TRAINPRED: T.walk(['actions', 0, 'result', 'TRAINPREDICTOR']),
	PREDICT: T.walk(['actions', 0, 'result', 'PREDICT'])
}

/**
 * Get test connector status every 5 seconds.
 * Continues until test connector is finished.
 *
 * @param {Function} waitCB - waitCB()
 */
var waitUntilFinished = exports.waitUntilFinished = function(IOD) {
	return function(waitCB) {
		var cb = function(err, status) {
			if (status.status === 'FINISHED' || status.status === 'IDLE' ||
				status.status === 'ERROR') {
				console.log('[WAIT] - Test connector finished running...')
				waitCB()
			}
			else {
				console.log('[WAIT] - Test connector not finished: ' +
					status.status + '...')
				setTimeout(commonIODReq.connectorStatus, 5000, IOD, cb)
			}
		}

		setTimeout(commonIODReq.connectorStatus, 5000, IOD, cb)
	}
}

exports.prepare = {
	/**
	 * Given a file path `filePath` store file in IDOL onDemand via storeobject action.
	 * Cached reference from results.
	 * Return cached if available.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {String} action - Action name
	 * @param {String} filePath - Path to file to store
	 * @param {Function} done - Done(null, reference)
	 */
	reference: function(IOD, action, filePath, done) {
		console.log('[PREPARING] - Preparing a object store reference...')
		if (action !== 'nocache' && cachedRef[action]) {
			console.log('[PREPARING] - Found a reference in the cache...')
			done(null, cachedRef[action])
		}
		else {
			console.log('[PREPARING] - Getting reference from IOD')
			commonIODReq.storeObject(IOD, filePath, function(err, ref) {
				cachedRef[action] = ref
				done(null, ref)
			})
		}
	},

	/**
	 * Checks if `test` index exists, if so delete it.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {Function} done - Done()
	 */
	cleanIndex: function(IOD, done) {
		var params = { type: 'content', flavor: 'explorer' }

		console.log('[PREPARING] - Preparing a clean index test...')
		commonIODReq.listResources(IOD, params, function(err, resources) {
			var test = _.find(resources.private_resources, function(resource) {
				return resource.resource === testIndex
			})
			if (test) {
				console.log('[PREPARING] - Test index found, deleting...')
				commonIODReq.deleteIndex(IOD, done)
			}
			else {
				console.log('[PREPARING] - Test index not found...')
				done()
			}
		})
	},

	/**
	 * Checks is test store exists, if so delete it.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {Function} done - Done()
	 */
	cleanStore: function(IOD, done) {
		console.log('[PREPARING] - Preparing a clean store test...')
		commonIODReq.listStores(IOD, function(err, stores) {
			var test = _.find(stores.stores, function(store) {
				return store === testStore
			})

			if (test) {
				console.log('[PREPARING] - Test store found, deleting...')
				commonIODReq.deleteStore(IOD, done)
			}
			else {
				console.log('[PREPARING] - Test store not found...')
				done()
			}
		})
	},

	/**
	 * Checks if test connector exists, if so delete it.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {Function} done - Done()
	 */
	cleanConnector: function(IOD, done) {
		var params = { type: 'connector', flavor: 'web_cloud'}

		console.log('[PREPARING] - Preparing a clean connector test...')
		commonIODReq.listResources(IOD, params, function(err, resources) {
			var test = _.find(resources.private_resources, function(resource) {
				return resource.resource === testCon
			})
			if (test) {
				console.log('[PREPARING] - Test connector found, waiting until finished...')
				waitUntilFinished(IOD)(function() {
					console.log('[PREPARING] - Test connector finished, deleting...')
					commonIODReq.deleteConnector(IOD, done)
				})
			}
			else {
				console.log('[PREPARING] - Test connector not found...')
				done()
			}
		})
	},

	/**
	 * Checks if `test` index exists, if not create it.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {Function} done - Done()
	 */
	testIndex: function(IOD, done) {
		console.log('[PREPARING] - Preparing a test index...')
		commonIODReq.listResources(IOD, { type: 'content' }, function(err, resources) {
			var testIndex = _.find(resources.private_resources, function(resource) {
				return resource.resource === exports.testIndex
			})
			if (testIndex) {
				console.log('[PREPARING] - Test index found...')
				done()
			}
			else {
				console.log('[PREPARING] - Text index not found, creating...')
				commonIODReq.createIndex(IOD, done)
			}
		})
	},

	/**
	 * Gets a delete token for `test` index.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {Function} done - Done(null, delete token)
	 */
	confirmToken: function(IOD, done) {
		console.log('[PREPARING] - Preparing a delete token...')
		deleteIndex(IOD, null, done)
	}
}

/**
 * Verifies action response with it's response schema.
 *
 * @param {String} action - Action name
 * @param {Object} response - Action response
 */
function iodRequestResultCheck(action, response) {
	var errors = shouldMatchResSchema(action, response)
	if (errors) throw new Error(action + ' failed to to match response schema, with ' +
		'errors: ' + prettyPrint(errors))
}

/**
 * Sends `deletetextindex` action.
 *
 * @param {IOD} IOD - IOD object
 * @param {String | null} confirm - Confirmation token
 * @param {Function} callback - Callback(null, token | null)
 */
function deleteIndex(IOD, confirm, callback) {
	var IODOpts = {
		action: T.attempt(commonPaths.DELETETI, 'deletetextindex')(IOD),
		params: _.defaults({ index: testIndex }, confirm ? { confirm: confirm } : {}),
		retries: 3
	}

	IOD.sync(IODOpts, function(err, res) {
		if (err) throw new Error('Deletetextindex errored: ' + prettyPrint(err))
		else if (confirm && (!res || !res.deleted || res.deleted !== true)) {
			console.log('CONFIRM: ', confirm)
			throw new Error('Failed to delete text index: ' + prettyPrint(res))
		}
		else if (!confirm && (!res || !res.confirm)) {
			throw new Error('Failed to get confirmation: ' + prettyPrint(res))
		}
		else {
			iodRequestResultCheck('deletetextindex', res)
			callback(null, confirm ? null : res.confirm)
		}
	})
}

var commonIODReq = exports.IODReq = {
	/**
	 * Sends `storeobject` action.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {String} filePath - File path to file to store
	 * @param {Function} callback - Callback(null, reference)
	 */
	storeObject: function(IOD, filePath, callback) {
		var IODOpts = {
			action: T.attempt(commonPaths.STOREOBJ, 'storeobject')(IOD),
			files: [filePath],
			getResults: true,
			retries: 3
		}
		IOD.sync(IODOpts, function(err, res) {
			if (err) throw new Error('Failed to store object: ' + prettyPrint(err))
			else {
				if (!res || !res.reference) {
					throw new Error('Could not find reference from storeobject: ' +
						prettyPrint(res))
				}
				iodRequestResultCheck('storeobject', res)
				callback(null, res.reference)
			}
		})
	},

	/**
	 * Sends `listresources` action.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {Object} params - IODOpts params
	 * @param {Function} callback - Callback(null, list of resources)
	 */
	listResources: function(IOD, params, callback) {
		var IODOpts = {
			action: T.attempt(commonPaths.LISTR, 'listresources')(IOD),
			params: params,
			retries: 3
		}
		IOD.sync(IODOpts, function(err, res) {
			if (err) throw new Error('Failed to get list of resources: ' + prettyPrint(err))
			else if (!res || !res.private_resources) {
				throw new Error('List of private resources not found: ' + prettyPrint(res))
			}
			else {
				iodRequestResultCheck('listresources', res)
				callback(null, res)
			}
		})
	},

	/**
	 * Sends `liststores` action.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {Function} callback - Callback(null, list of stores)
	 */
	listStores: function(IOD, callback) {
		var IODOpts = {
			action: T.attempt(commonPaths.LISTSTORE, 'liststores')(IOD),
			params: {},
			retries: 3
		}

		IOD.sync(IODOpts, function(err, res) {
			if (err) throw new Error('Failed to get list of stores: ' + prettyPrint(err))
			else if (!res || !res.stores) {
				throw new Error('List of stores not found: ' + prettyPrint(res))
			}
			else {
				iodRequestResultCheck('liststores', res)
				callback(null, res)
			}
		})
	},

	/**
	 * Sends `createtextindex` action, creating a `test` index.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {Function} callback - Callback()
	 */
	createIndex: function(IOD, callback) {
		var IODOpts = {
			action: T.attempt(commonPaths.CREATETI, 'createtextindex')(IOD),
			params: {
				index: testIndex,
				flavor: 'explorer'
			},
			retries: 3
		}
		IOD.sync(IODOpts, function(err, res) {
			if (err) throw new Error('Failed to create test index: ' + prettyPrint(err))
			else if (!res || res.message !== 'index created') {
				throw new Error('Test index was not created successfully: ' +
					prettyPrint(res))
			}
			else {
				iodRequestResultCheck('createtextindex', res)
				callback(null, res)
			}
		})
	},

	/**
	 * Force deletes `test` index.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {Function} callback - Callback()
	 */
	deleteIndex: function(IOD, callback) {
		deleteIndex(IOD, null, function(err, confirm) {
			deleteIndex(IOD, confirm, callback)
		})
	},

	/**
	 * Deletes test store.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {Function} callback - Callback()
	 */
	deleteStore: function(IOD, callback) {
		var IODOpts = {
			action: T.attempt(commonPaths.DELSTORE, 'deletestore')(IOD),
			params: { store: testStore },
			retries: 3
		}

		IOD.sync(IODOpts, function(err, res) {
			if (err) throw new Error('Failed to delete test store: ' + prettyPrint(err))
			else if (!res || !res.message || res.message !== 'store was deleted') {
				throw new Error('Failed to delete test store: ' + prettyPrint(res))
			}
			else {
				iodRequestResultCheck('deletestore', res)
				callback()
			}
		})
	},

	/**
	 * Deletes test connector.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {Function} callback - Callback()
	 */
	deleteConnector: function(IOD, callback) {
		var IODOpts = {
			action: T.attempt(commonPaths.DELCON, 'deleteconnector')(IOD),
			params: { connector: testCon },
			retries: 2
		}

		IOD.sync(IODOpts, function(err, res) {
			if (err) throw new Error('Failed to delete test connector: ' + prettyPrint(err))
			else if (!res || !res.deleted) {
				throw new Error('Failed to delete test connector: ' + prettyPrint(res))
			}
			else {
				iodRequestResultCheck('deleteconnector', res)
				callback()
			}
		})
	},

	/**
	 * Sends `connectorstatus` action.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {Function} callback - Callback(null, status)
	 */
	connectorStatus: function(IOD, callback) {
		var IODOpts = {
			action: T.attempt(commonPaths.CONSTATUS, 'connectorstatus')(IOD),
			params: { connector: testCon }
		}

		IOD.sync(IODOpts, function(err, res) {
			if (err) throw new Error('Failed to get connector status: ' + prettyPrint(err))
			else if (!res || !res.status) {
				throw new Error('Failed to get connector status: ' + prettyPrint(res))
			}
			else {
				iodRequestResultCheck('connectorstatus', res)
				callback(null, res)
			}
		})
	}
}

/**
 * Returns stringified value `v` with 2 space separation.
 *
 * @param {*} v - Some value
 * @returns {String}
 */
var prettyPrint = exports.prettyPrint = function(v) {
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
 * Sets 300 seconds as timeout for test.
 *
 * @param {Object} that - this
 */
exports.timeout = function(that) {
	that.timeout(timeout)
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
 * Default it check. Checks that request was successful and results are valid.
 *
 * @param {String} action - Action name
 * @returns {Array} - It checks
 */
exports.defIt = function(action) {
	return [
		shouldBeSuccessful,
		_.partial(shouldHaveResults, action)
	]
}

/**
 * Checks that action result matches it's response schema.
 *
 * @param {String} action - Action name
 * @param {Object} result - Action results
 * @param {Object} env - Environment object
 * @returns {Array | null} - Schema errors
 */
function shouldMatchResSchema(action, result, env) {
	var errors = SchemaU.validateWithPrettyErr(cachedIOD, action + '.response',
		result)

	if (errors) {
		console.log('Results did not match', action,
			'\'s response schema:', prettyPrint(errors))
		console.log('Results: ', prettyPrint(result))
		console.log('Response: ', prettyPrint(env ? env.response : result))
	}

	should.not.exist(errors)
	return errors
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

	if (!error) console.log('shouldBeInSchemaError - env.error:', prettyPrint(env.error))

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
	if (!env.error) console.log('shouldError - env: ', prettyPrint(env))
	should.exists(env.error)
	return env
}

/**
 * Validates that environment object `env` does not contain an error.
 *
 * @param {Object} env - Environment object
 * @returns {Object} - env
 */
var shouldBeSuccessful = exports.shouldBeSuccessful = function(env) {
	if (env.error) console.log('shouldBeSuccessful - env.error:', prettyPrint(env.error))

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
var shouldHaveResults = exports.shouldHaveResults = function(action, env) {
	var jobActionResults = env.response.actions
	if (jobActionResults) {
		_.each(jobActionResults, function(actionRes) {
			if (shouldMatchResSchema(action, actionRes.result, env)) return false
		})
	}
	else shouldMatchResSchema(action, env.response, env)
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