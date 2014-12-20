/**
 * Schema related utilities.
 * @module lib/schema
 */

'use strict';

var jjv = require('jjv')
var _ = require('lodash')
var jjve = require('jjve')
var T = require('./transform')
var CONSTANTS = require('./constants')

/**
 * Initializes jjv schemas.
 *
 * Modifies IOD object in place.
 *
 * @param {IOD} IOD - IOD object
 */
exports.initSchemas = function(IOD) {
	IOD.schemas = new jjv()
	IOD.prettyErr = jjve(IOD.schemas)

	// Add Coercions
	IOD.schemas.addTypeCoercion('integer', T.try(T.seq([T.asNumber, Math.floor])))
	IOD.schemas.addTypeCoercion('number', T.try(T.asNumber))
	IOD.schemas.addTypeCoercion('string', T.try(String.toString))
	IOD.schemas.addTypeCoercion('boolean', T.try(T.asBoolean))
	IOD.schemas.addTypeCoercion('uri', _.identity)
	IOD.schemas.addTypeCoercion('array', T.try(T.maybeToArray))
	IOD.schemas.addTypeCoercion('object', T.try(JSON.parse))
	IOD.schemas.addTypeCoercion('null', _.identity)

	// Allow defaults
	IOD.schemas.defaultOptions.useDefault = true
	// Allow coercions
	IOD.schemas.defaultOptions.useCoerce = true

	exports.addReqTypeSchemas(IOD)
}

/**
 * Initializes all request type schemas.
 *
 * Modifies IOD object in place.
 *
 * @param {IOD} IOD - IOD object
 */
exports.addReqTypeSchemas = function(IOD) {
	_.each(CONSTANTS.TYPES, function(type) {
		var schema = require(__dirname + '/schemas/' + type)
		schema = schema(
			_.mapValues(IOD.ACTIONS, _.values),
			_.values(CONSTANTS.VERSIONS.MAJOR),
			_.values(CONSTANTS.VERSIONS.API)
		)

		IOD.schemas.addSchema(type, schema)
	})
}

/**
 * Initializes all action schemas with available actions
 * for this apiKey.
 * Add action inputs to IOD object.
 * Add action parameters to IOD object.
 * Add action parameter pairs to IOD object.
 * Add action parameter aliases to IOD object.
 *
 * Modifies IOD object in place.
 *
 * @param {IOD} IOD - IOD object
 * @param {Array} apiList - List of transformed apis
 */
exports.addActionSchemas = function(IOD, apiList) {
	var existingInputs = ['text', 'file', 'reference', 'url', 'json']

	_.each(apiList, function(api, actionName) {
		var actParamName = actionName + '.parameters'
		var actResponseName = actionName + '.response'

		IOD.schemas.addSchema(actParamName, api.paramSchema)
		IOD.schemas.addSchema(actResponseName, api.resSchema)

		// Collect action parameters
		var parameters = _(api.paramSchema.properties).omit(existingInputs).keys()
		IOD.schemas.parameters = IOD.schemas.parameters || {}
		IOD.schemas.parameters[actionName] = parameters

		// Collect action inputs
		var inputs = _.pick(api.paramSchema.properties, existingInputs)
		IOD.schemas.inputs = IOD.schemas.inputs || {}
		IOD.schemas.inputs[actionName] = _.keys(inputs)

		_.each(api.paramSchema.properties, function(paramSchema, paramName) {
			// Collect action pairs
			if (paramSchema.pairs) {
				IOD.schemas.pairs = IOD.schemas.pairs || {}
				IOD.schemas.pairs[actionName] = IOD.schemas.pairs[actionName] || {}
				IOD.schemas.pairs[actionName][paramName] = paramSchema.pairs
			}

			// Add action parameter aliases to parameter schema
			if (paramSchema.aliases) {
				_.each(paramSchema.aliases, function(paramAlias) {
					IOD.schemas.schema[actParamName].properties[paramAlias] =
						IOD.schemas.schema[actParamName].properties[paramName]
				})
			}
		})
	})
}

/**
 * JJV validates schema with pretty errors.
 *
 * @param {IOD} IOD - IOD object
 * @param {String} schema - Schema name
 * @param {Object} object - Object to validate
 * @returns {array | null} - Errors
 */
exports.validateWithPrettyErr = function(IOD, schema, object) {
	var errors = IOD.schemas.validate(schema, object)

	if (errors) return IOD.prettyErr(schema, object, errors)
	else return null
}

/**
 * Validates that specified action has one of the required inputs.
 *
 * @param {IOD} IOD - IOD object
 * @param {Object} IODOpts - IOD options
 * @returns {string | null} - If missing required inputs
 */
exports.validateActionInputs = function(IOD, IODOpts) {
	var inputs = IOD.schemas.inputs[IODOpts.action]
	var params = IODOpts.params || {}

	if (IODOpts.files) params.file = true

	if (!_.isEmpty(inputs) &&
		!_.intersection(inputs, _.keys(params)).length) {
		return 'Missing one of the required inputs: ' + inputs
	}
	else if (IODOpts.params && IODOpts.files) delete IODOpts.params.file
}

/**
 * Validates that specified action parameters don't have any uneven length pairs.
 *
 * @param {IOD} IOD - IOD object
 * @param {Object} IODOpts - IOD options
 * @returns {string | null} - If uneven length pairs
 */
exports.validateParamPairs = function(IOD, IODOpts) {
	var pairs = IOD.schemas.pairs[IODOpts.action]
	var params = IODOpts.params || {}
	var error = null

	// Action parameters has no pairs
	if (!pairs) return
	if (IODOpts.files) params.file = IODOpts.files

	_.each(params, function(paramVal, mainParam) {
		var existPairs = pairs[mainParam]

		if (existPairs) {
			var existMainParam = T.maybeToArray(params[mainParam])

			_.each(existPairs, function(secondaryParam) {
				var existSecParam = T.maybeToArray(params[secondaryParam])

				if (!_.isEmpty(existSecParam) && _.size(existSecParam) !== _.size(existMainParam)) {
					error = 'The following parameters are pairs and required to have the same ' +
						'length: ' + [mainParam].concat(existPairs)
				}
			})
		}
	})

	if (IODOpts.params && IODOpts.files) delete IODOpts.params.file

	return error
}

/**
 * Validates action with parameter schema.
 * Temporarily turns off `useDefault`.
 *
 * @param {IOD} IOD - IOD object
 * @param {String} action - IOD action name
 * @param {Object} params - IOD action parameters
 * @returns {array | null} - Errors
 */
exports.validateAction = function(IOD, action, params) {
	IOD.schemas.defaultOptions.useDefault = false

	var actionErr = exports.validateWithPrettyErr(IOD, action + '.parameters',
		params || {})

	IOD.schemas.defaultOptions.useDefault = true
	return actionErr
}

/**
 * Maps validation types to validation method.
 */
var validationMap = {
	/**
	 * Validates IOD action schema along with their required inputs.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {Object} IODOpts - IOD options object
	 * @returns {object | null} - Schema errors
	 */
	action: function validateIODActions(IOD, IODOpts) {
		// Validate IOD action schema
		var actionErr = exports.validateAction(IOD, IODOpts.action, IODOpts.params)
		if (actionErr) return actionErr

		// Validate IOD action required inputs
		var inputErr = exports.validateActionInputs(IOD, IODOpts)
		if (inputErr) return inputErr

		// Validate IOD action parameter pairs
		var pairErr = exports.validateParamPairs(IOD, IODOpts)
		if (pairErr) return pairErr
	},

	/**
	 * Validates IOD action schema for every action in job, along with their required inputs.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {Object} IODOpts - IOD options object
	 * @returns {object | null} - Schema errors
	 */
	job: function validateIODJob(IOD, IODOpts) {
		var job = IODOpts.job
		var errors = []

		_.each(job.actions, function(action) {
			// Validate every IOD action in job
			var err = exports.validateAction(IOD, action.name, action.params)
			if (err) return errors.push({
				action: action.name,
				error: err
			})

			// Validate every IOD action required inputs in job
			var inputErr = exports.validateActionInputs(IOD, {
				action: action.name,
				params: action.params
			})
			if (inputErr) return errors.push({
				action: action.name,
				error: inputErr
			})

			// Validate every IOD action parameter pairs in job
			var pairErr = exports.validateParamPairs(IOD, {
				action: action.name,
				params: action.params
			})
			if (pairErr) return errors.push({
				action: action.name,
				error: pairErr
			})
		})

		if (errors.length) return errors
	}
}

/**
 * Validates IOD request type schema.
 * Validates IOD action schema.
 * Validates IOD action required inputs.
 *
 * @param {IOD} IOD - IOD object
 * @param {Object} IODOpts - IOD options
 * @param {String} apiType - IOD request type
 * @param {Function} callback - Callback(err | null)
 */
exports.validateIOD = function(IOD, IODOpts, apiType, callback) {
	T.compactObj(IODOpts.params)

	var validation = IOD.schemas.schema[apiType].validation
	var validate = validationMap[validation]

	// Validates IOD request type schema
	var reqTypeErr = exports.validateWithPrettyErr(IOD, apiType, IODOpts)
	if (reqTypeErr) return callback(reqTypeErr)

	var errors = validate && validate(IOD, IODOpts)
	if (errors) return callback(errors)

	callback()
}