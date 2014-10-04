/**
 * IOD utilities.
 * @module lib/iod
 */

'use strict';

var _ = require('lodash')
var SendU = require('./send')
var T = require('./transform')
var SchemaU = require('./schema')

var async = require('./async-ext')
var apply = async.apply

/**
 * Makes http path depending on api type.
 *
 * @param {IOD} IOD - IOD object
 * @param {object} IODOpts - IOD options
 * @param {string} apiType - IOD request type
 * @returns {string} Http path
 */
exports.makePath = function(IOD, IODOpts, apiType) {
	if (apiType === IOD.TYPES.SYNC || apiType === IOD.TYPES.ASYNC) {
		return ['/', IODOpts.majorVersion, '/api/', apiType, '/',
			IODOpts.action, '/', IODOpts.apiVersion].join('')
	}
	else if (apiType === IOD.TYPES.RESULT || apiType === IOD.TYPES.STATUS) {
		return['/', IODOpts.majorVersion, '/job/', apiType, '/',
			IODOpts.jobId].join('')
	}
	else if (apiType === IOD.TYPES.JOB) {
		return ['/', IODOpts.majorVersion, '/job'].join('')
	}
	else if (apiType === IOD.TYPES.DISCOVERY) {
		return ['/', IODOpts.majorVersion, '/discovery/', IODOpts.action].join('')
	}
	else return ''
}

/**
 * Sends discovery api action to get all available actions for this api key.
 *
 * @param {IOD} IOD - IOD object
 * @param {function} callback - Callback(err, actions)
 */
exports.getAvailableApis = function(IOD, callback) {
	/**
	 * Extracts the action names, aliases, and schemas from a discovery api action response.
	 *
	 * @param {array} Apis - Discovery api action response
	 * @returns {array} List of action/aliases
	 */
	var apisT = function(Apis) {
		return _.map(Apis, function(api) {
			return {
				action: api.id,
				aliases: api.aliases,
				schema: api.parameters.schema
			}
		})
	}

	var IODOpts = {
		majorVersion: IOD.VERSIONS.MAJOR.V1,
		action: IOD.ACTIONS.DISCOVERY.API,
		method: 'get',
		params: {
			apikey: IOD.apiKey,
			max_results: 100,
			full_definition: true
		}
	}

	SendU.send(IOD, IODOpts, IOD.TYPES.DISCOVERY,
		async.split(function success(res) {
			callback(null, apisT(res))
		}, function error(err) {
			if (err.message && _.contains(err.message.toLowerCase(), 'api key')) {
				callback('Invalid api key: ' +  IOD.apiKey)
			}
			else callback('One of the following are invalid, host: ' + IOD.host +
				', port: ' + IOD.port + '. Please make sure HTTP_PROXY and HTTPS_PROXY ' +
				'environment variables are set correctly if you are using a proxy. ')
		})
	)
}

/**
 * Expands actions with their aliases.
 *
 * @param {array} Apis - List of api actions
 * @returns {array} Transformed list of api actions
 */
exports.actionsT = function(Apis) {
	return _(Apis)
		.map(function(api) {
			var actionPairs = _.map(T.maybeToArray(api.aliases), function(alias) {
				return [alias.toUpperCase(), api.action.toLowerCase()]
			})

			return actionPairs.concat([
				[api.action.toUpperCase(), api.action.toLowerCase()]
			])
		})
		.flatten(true)
		.compact()
		.zipObject()
		.value()
}

/**
 * Wraps any synchronous IOD requests and sends requests.
 *
 * @param {IOD} IOD - IOD object
 * @param {object} IODOpts - IOD options
 * @param {string} apiType - IOD request type
 * @param {function} callback - Callback(err, IOD response)
 */
exports.syncAction = function(IOD, IODOpts, apiType, callback) {
	SchemaU.validateIOD(IOD, IODOpts, apiType, async.split(function() {
		SendU.send(IOD, IODOpts, apiType, callback)
	}, callback))
}

/**
 * Wraps any synchronous IOD requests and sends requests. If
 * getResults in IODOps is true, send IOD.result request.
 *
 * @param {IOD} IOD - IOD object
 * @param {object} IODOpts - IOD options
 * @param {string} apiType - IOD request type
 * @param {function} callback - Callback(err, IOD response)
 */
exports.asyncAction = function(IOD, IODOpts, apiType, callback) {
	SchemaU.validateIOD(IOD, IODOpts, apiType, async.split(function() {
		if (apiType === IOD.TYPES.JOB) {
			IODOpts.params = { job: JSON.stringify(IODOpts.job) }
		}

		/**
		 * If getResults is true and jobId is found, send IOD result request.
		 *
		 * @param {object} asyncRes - Async request response
		 * @param {function} callback - Callback(err, IOD response))
		 */
		var asyncGetResults = function(asyncRes, callback) {
			var jobId = asyncRes.jobID

			if (!jobId) callback(null, asyncRes)
			else IOD.result({
				jobId: jobId,
				majorVersion: IODOpts.majorVersion
			}, callback)
		}

		async.waterfall([
			apply(SendU.send, IOD, IODOpts, apiType),

			async.when(IODOpts.getResults, asyncGetResults, async.constant)
		], callback)
	}, callback))
}