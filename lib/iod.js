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
 * @param {Object} IODOpts - IOD options
 * @param {String} apiType - IOD request type
 * @returns {String} Http path
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
 * @param {Function} callback - Callback(err, actions)
 */
exports.getAvailableApis = function(IOD, callback) {
	/**
	 * Returns a list of api objects: {
	 * 	<action | alias>: {
	 * 	    {Object} paramSchema - Schema for action parameters,
	 * 	    {Object} resSchema - Schema for action response
	 * 	}
	 * }
	 *
	 * @param {Array} Apis - Discovery api action response
	 * @returns {Array} List of api objects
	 */
	var apisT = function(Apis) {
		return _(Apis)
			.map(function(api) {
				var actionPairs = _.map(T.maybeToArray(api.aliases), function(alias) {
					return [alias.toLowerCase(), {
						paramSchema: api.parameters.schema,
						resSchema: api.response.schema
					}]
				})

				return actionPairs.concat([
					[api.id.toLowerCase(), {
						paramSchema: api.parameters.schema,
						resSchema: api.response.schema
					}]
				])
			})
			.flatten(true)
			.zipObject()
			.value()
	}

	var IODOpts = {
		majorVersion: IOD.VERSIONS.MAJOR.V1,
		action: IOD.ACTIONS.DISCOVERY.API,
		method: 'get',
		params: {
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

exports.getFlavorSchemas = function(IOD, callback) {
	var flavorSchemaModel = {}
	var getList = T.attempt(T.walk(['details', 'possible']), [])

	var parameterSchema = function(params, transformError, done) {
		var IODOpts = {
			majorVersion: IOD.VERSIONS.MAJOR.V1,
			action: 'parameterSchema',
			method: 'get',
			params: params
		}

		SendU.send(IOD, IODOpts, IOD.TYPES.DISCOVERY, function(err, res) {
			if (err) {
				if (transformError) done(null, transformError(err))
				else done(err)
			}
			else done(null, res)
		})
	}

	async.waterfall([
		apply(parameterSchema, {}, getList),

		function getFlavorModel(apiList, done) {
			var model = []

			if (!apiList || _.isEmpty(apiList)) done(null, [])
			else async.each(apiList, function(api, apiCB) {
				parameterSchema({ api: api }, getList, async.doneFn(apiCB,
					function(flavorList) {
						model.push([api, flavorList])
					})
				)
			}, async.doneFn(done, function() {
				return model
			}))
		},

		function buildFlavorSchemaModel(flavorModel, done) {
			if (!flavorModel || _.isEmpty(flavorModel)) done()
			else async.each(flavorModel, function(pair, pairCB) {
				var api = pair[0]
				var flavors = pair[1]

				async.each(flavors, function(flavor, flavorCB) {
					parameterSchema({ api: api, flavor: flavor }, null,
						async.doneFn(flavorCB, function(schema) {
							flavorSchemaModel[api] = flavorSchemaModel[api] || {}
							flavorSchemaModel[api][flavor] = schema
						})
					)
				}, pairCB)
			}, done)
		}
	], async.doneFn(callback, function() {
		return _.isEmpty(flavorSchemaModel) ? null : flavorSchemaModel
	}))
}

/**
 * Wraps any synchronous IOD requests and sends requests.
 *
 * @param {IOD} IOD - IOD object
 * @param {Object} IODOpts - IOD options
 * @param {String} apiType - IOD request type
 * @param {Function} callback - Callback(err, IOD response)
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
 * @param {Object} IODOpts - IOD options
 * @param {String} apiType - IOD request type
 * @param {Function} callback - Callback(err, IOD response)
 */
exports.asyncAction = function(IOD, IODOpts, apiType, callback) {
	SchemaU.validateIOD(IOD, IODOpts, apiType, async.split(function() {
		if (apiType === IOD.TYPES.JOB) {
			// prepare params for every action in job
			IODOpts.job.actions = _.map(IODOpts.job.actions, function(action) {
				if (!action.params) return action
				else {
					action.params = SendU.prepareParams(action.params)
					return action
				}
			})

			IODOpts.params = { job: JSON.stringify(IODOpts.job) }
		}

		/**
		 * If getResults is true and jobId is found, send IOD result request.
		 *
		 * @param {Object} asyncRes - Async request response
		 * @param {Function} callback - Callback(err, IOD response))
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