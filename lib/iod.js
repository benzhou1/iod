/**
 * IOD utilities.
 * @module lib/iod
 */

'use strict';

var _ = require('lodash')
var SendU = require('./send')
var T = require('./transform')
var request = require('request')
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
		},
		retries: 3
	}

	SendU.send(IOD, IODOpts, IOD.TYPES.DISCOVERY,
		async.split(function success(res) {
			// Handle proxy issues
			if (!_.isArray(res)) callback(res)
			else callback(null, apisT(res))
		}, function error(err) {
			if (err.message && _.contains(err.message.toLowerCase(), 'api key')) {
				callback('Invalid api key: ' +  IOD.apiKey)
			}
			else if (err.error && err.error === 2000 || err.error === 2001 || err.error === 2002) {
				callback('Invalid api key: ' +  IOD.apiKey)
			}
			else callback(err)
		})
	)
}

/**
 * Get flavor schemas, by first getting a list of possible apis and list of possible flavors
 * for each api. Then make a parameterSchema request to get all flavor specified schemas.
 *
 * @param {IOD} IOD - IOD object
 * @param {Function} callback - Callback(err, schemaModel)
 */
exports.getFlavorSchemas = function(IOD, callback) {
	var flavorSchemaModel = {}
	var getList = T.attempt(T.walk(['details', 'possible']), [])

	var parameterSchema = function(params, transformError, done) {
		var IODOpts = {
			majorVersion: IOD.VERSIONS.MAJOR.V1,
			action: 'parameterSchema',
			method: 'get',
			params: params,
			retries: 3
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
 * @param {Object} [reqOpts] - Request options for current request
 * @param {Function} callback - Callback(err, IOD response)
 */
exports.syncAction = function(IOD, IODOpts, apiType, reqOpts, callback) {
	// `reqOpts` is optional
	if (_.isFunction(reqOpts)) {
		callback = reqOpts
		reqOpts = {}
	}

	SchemaU.validateIOD(IOD, IODOpts, apiType, async.split(function() {
		SendU.send(IOD, IODOpts, apiType, reqOpts, callback)
	}, callback))
}

/**
 * Wraps any synchronous IOD requests and sends requests. If
 * getResults in IODOps is true, send IOD.result request.
 *
 * @param {IOD} IOD - IOD object
 * @param {Object} IODOpts - IOD options
 * @param {String} apiType - IOD request type
 * @param {Object} [reqOpts] - Request options for current request
 * @param {Function} callback - Callback(err, IOD response)
 */
exports.asyncAction = function(IOD, IODOpts, apiType, reqOpts, callback) {
	// `reqOpts` is optional
	if (_.isFunction(reqOpts)) {
		callback = reqOpts
		reqOpts = {}
	}

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
		 * Sends results of request to specified callback.
		 *
		 * @param {*} results - Results of request
		 */
		var sendCallback = function(results) {
			// Only do so if `callback` is specified
			if (IODOpts.callback) {
				var options = { url: IODOpts.callback.uri }
				var res = JSON.stringify(results)

				// Url-encode use `form` property
				if (IODOpts.callback.method === 'encoded') {
					options.form = { results: res }
				}

				var r = request.post(options, function(err, res) {
					// Emits `CbError` if any error occurs while sending results to callback
					if (err) IOD.eventEmitter.emit('CbError', err)
					else if (res.statusCode !== 200) {
						IOD.eventEmitter.emit('CbError', 'Status Code: ' + res.statusCode)
					}
				})

				// Multipart use form object
				if (IODOpts.callback.method === 'multipart') {
					var form = r.form()
					form.append('results', res)

					form.on('error', function(err) {
						IOD.evenEmitter.emit('CBError', err)
					})
				}
			}
		}

		/**
		 * Periodically get status of a job with specified job id `jobId`.
		 * Do so until job has finished or failed.
		 *
		 * @param {String} jobId - Job id
		 */
		var pollUntilDone = function(jobId) {
			var isFinished = function(res) {
				return res && res.status &&
					(res.status === 'finished' || res.status === 'failed')
			}

			var poll = function() {
				IOD.status({ jobId: jobId }, function(err, res) {
					// Emits err as first argument
					if (err) IOD.eventEmitter.emit(jobId, err)
					else if (isFinished(res)) {
						IOD.eventEmitter.emit(jobId, null, res)
						sendCallback(res)
					}
					else setTimeout(poll, IODOpts.pollInterval)
				})
			}

			setTimeout(poll, IODOpts.pollInterval)
		}

		/**
		 * If getResults is true and jobId is found, send IOD result request.
		 *
		 * @param {Object} asyncRes - Async request response
		 * @param {Function} callback - Callback(err, IOD response))
		 */
		var asyncGetResults = function(asyncRes, callback) {
			var jobId = asyncRes.jobID

			if (!jobId) return callback(null, asyncRes)
			else if (IODOpts.getResults) {
				IOD.result({
					jobId: jobId,
					majorVersion: IODOpts.majorVersion,
					retries: 3
				}, callback)
			}
			else {
				callback(null, asyncRes)
				pollUntilDone(jobId)
			}

		}

		async.waterfall([
			apply(SendU.send, IOD, IODOpts, apiType, reqOpts),
			asyncGetResults
		], callback)
	}, callback))
}