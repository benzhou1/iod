/**
 * Idol on Demand module.
 * Allows for easy sync, async, status, result, job request to Idol on Demand.
 * @module lib/IOD
 */

'use strict';

var url = require('url')
var _ = require('lodash')
var IodU = require('./lib/iod')
var SchemaU = require('./lib/schema')
var async = require('./lib/async-ext')
var CONSTANTS = require('./lib/constants')

/**
 * Creates a IOD object with specified apiKey, host and port.
 *
 * @param {string} apiKey - Api key
 * @param {string}host - IOD host
 * @param {integer} port - IOD port
 * @param {integer} reqOpts - Request options
 * @property {string} apiKey - Api key
 * @property {string} host - IOD host
 * @property {integer} port - IOD port
 * @property {object} reqOpts - Request options
 * @constructor
 * @throws {Error}
 * 	If api key does not exists.
 * 	If host does not contain protocol
 */
var IOD = function(apiKey, host, port, reqOpts) {
	var iod = this

	if (_.isObject(host)) {
		reqOpts = host
		host = undefined
	}
	else if (_.isObject(port)) {
		reqOpts = port
		port = undefined
	}

	if (!apiKey) throw Error('IOD apiKey is missing!')
	else if (host && !url.parse(host, false, true).protocol) {
		throw Error('Protocol not found on host: ' + host)
	}

	var httpHost = 'http://api.idolondemand.com'
	var httpsHost = 'https://api.idolondemand.com'
	var httpPort = 80
	var httpsPort = 443

	// If Https port point to Https host and vice versa
	if (host == null && port === httpsPort) host = httpsHost
	else if (host == null && port === httpPort) host = httpHost
	else if (port == null && host && host.toLowerCase() === httpsHost) port = httpsPort
	else if (port == null && host && host.toLowerCase() === httpHost) port = httpPort

	iod.apiKey = apiKey
	iod.host = host || httpsHost
	iod.port = port || httpsPort
	iod.reqOpts = _.defaults(reqOpts || {}, { timeout: 20000 })
	this.ACTIONS = _.cloneDeep(CONSTANTS.ACTIONS)

	SchemaU.initSchemas(iod)

	_.bindAll.apply(_, [iod].concat(_.functions(IOD.prototype)))
}

module.exports = IOD

/**
 * Returns new initialized IOD object.
 * Automatically gets all the available actions for specified api key.
 *
 * @param {string} apiKey - Api key
 * @param {string} host - Optional IOD host
 * @param {integer} port - Optional IOD port
 * @param {object} reqOpts - Optional Request options
 * @param {function} callback - Callback(err, IOD)
 */
IOD.create = function(apiKey, host, port, reqOpts, callback) {
	if (_.isFunction(host)) {
		callback = host
		host = undefined
	}
	else if (_.isFunction(port)) {
		callback = port
		port = undefined
	}
	else if (_.isFunction(reqOpts)) {
		callback = reqOpts
		reqOpts = undefined
	}

	var iod = new IOD(apiKey, host, port, reqOpts)

	IodU.getAvailableApis(iod, async.doneFn(callback, function(apis) {
		var apiEnums = _.mapValues(apis, function(value, actionName) {
			return actionName.toLowerCase()
		})

		_.defaults(iod.ACTIONS, { API: apiEnums })
		SchemaU.addReqTypeSchemas(iod)
		SchemaU.addActionSchemas(iod, apis)

		return iod
	}))
}

/**
 * IOD request type constants.
 *
 * @type object
 * @constant
 * @property {string} SYNC - Sync type request.
 * @property {string} ASYNC - ASync type request.
 * @property {string} RESULT - Result type request.
 * @property {string} STATUS - Status type request.
 * @property {string} JOB - Job type request.
 * @property {string} DISCOVERY - Discovery type request.
 * @see types.js
 */
IOD.prototype.TYPES = CONSTANTS.TYPES

/**
 * IOD version constants.
 *
 * @type object
 * @constant
 * @property {object} MAJOR - Major version.
 * @property {string} MAJOR.V1 - 1.0 Major version.
 * @property {object} API - Action version.
 * @property {string} API.V1 - V1 Api version.
 * @see versions.js
 */
IOD.prototype.VERSIONS = CONSTANTS.VERSIONS

/**
 * Send an IOD sync request.
 * `callback` will be passed an error as the first argument and the IOD response as
 * the second argument.
 *
 * IOD.sync({ action: IOD.ACTIONS.API.ANALYZESENTIMENT, param: { text: '=)' } },
 * 		function(err, res) {
 * 			console.log('ERR: ', err)
 * 			console.log('RES: ', res)
 * 		}
 * )
 *
 * @param {object} IODOpts - IOD options
 * @param {function} callback - Callback(err, IOD response)
 * @see sync.js for IODOpts schema
 */
IOD.prototype.sync = function(IODOpts, callback) {
	var IOD = this
	IodU.syncAction(IOD, _.cloneDeep(IODOpts), IOD.TYPES.SYNC, callback)
}

/**
 * Send an IOD async request.
 * `callback` will be passed an error as the first argument and the IOD response as
 * the second argument.
 *
 * IOD.async({ action: IOD.ACTIONS.API.ANALYZESENTIMENT, param: { text: '=)' } },
 * 		function(err, res) {
 * 			console.log('ERR: ', err)
 * 			console.log('RES: ', res)
 * 		}
 * )
 *
 * @param {object} IODOpts - IOD options
 * @param {function} callback - Callback(err, IOD response)
 * @see async.js for IODOpts schema
 */
IOD.prototype.async = function(IODOpts, callback) {
	var IOD = this
	IodU.asyncAction(IOD, _.cloneDeep(IODOpts), IOD.TYPES.ASYNC, callback)
}

/**
 * Send an IOD result request.
 * `callback` will be passed an error as the first argument and the IOD response as
 * the second argument.
 *
 * IOD.result({ jobId: 'job id' }, function(err, res) {
 * 		console.log('ERR: ', err)
 * 		console.log('RES: ', res)
 * })
 *
 * @param {object} IODOpts - IOD options
 * @param {function} callback - Callback(err, IOD response)
 * @see result.js for IODOpts schema
 */
IOD.prototype.result = function(IODOpts, callback) {
	var IOD = this
	IodU.syncAction(IOD, _.cloneDeep(IODOpts), IOD.TYPES.RESULT, callback)
}

/**
 * Send an IOD status request.
 * `callback` will be passed an error as the first argument and the IOD response as
 * the second argument.
 *
 * IOD.status({ jobId: 'job id' }, function(err, res) {
 * 		console.log('ERR: ', err)
 * 		console.log('RES: ', res)
 * })
 *
 * @param {object} IODOpts - IOD options
 * @param {function} callback - Callback(err, IOD response)
 * @see status.js for IODOpts schema
 */
IOD.prototype.status = function(IODOpts, callback) {
	var IOD = this
	IodU.syncAction(IOD, _.cloneDeep(IODOpts), IOD.TYPES.STATUS, callback)
}

/**
 * Send an IOD job request.
 * `callback` will be passed an error as the first argument and the IOD response as
 * the second argument.
 *
 * IOD.job({ job: {
 * 		actions: [
 * 			{ name: IOD.ACTIONS.API.ANALYZESENTIMENT, params: { text: '=)' } },
 * 			{ name: IOD.ACTIONS.API.ANALYZESENTIMENT, params: { text: '=(' } }
 * 		]
 * } }, function(err, res) {
 * 		console.log('ERR: ', err)
 * 		console.log('RES: ', res)
 * })
 *
 * @param {object} IODOpts - IOD options
 * @param {function} callback - Callback(err, IOD response)
 * @see job.js for IODOpts schema
 */
IOD.prototype.job = function(IODOpts, callback) {
	var IOD = this
	IodU.asyncAction(IOD, _.cloneDeep(IODOpts), IOD.TYPES.JOB, callback)
}

/**
 * Send an IOD discovery request.
 * `callback` will be passed an error as the first argument and the IOD response as
 * the second argument.
 *
 * IOD.discovery({ action: IOD.ACTIONS.DISCOVERY.API }, function(err, res) {
 * 		console.log('ERR: ', err)
 * 		console.log('RES: ', res)
 * })
 *
 * @param {object} IODOpts - IOD options
 * @param {function} callback - Callback(err, IOD response)
 * @see job.js for IODOpts schema
 */
IOD.prototype.discovery = function(IODOpts, callback) {
	var IOD = this
	IodU.syncAction(IOD, _.cloneDeep(IODOpts), IOD.TYPES.DISCOVERY, callback)
}