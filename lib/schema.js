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
 *
 * Modifies IOD object in place.
 *
 * @param {IOD} IOD - IOD object
 * @param {array} apiList - List of transformed apis
 */
exports.addActionSchemas = function(IOD, apiList) {
	_.each(apiList, function(api) {
		IOD.schemas.addSchema(api.action, api.schema)
	})
}

/**
 * JJV validates schema with pretty errors.
 *
 * @param {IOD} IOD - IOD object
 * @param {string} schema - Schema name
 * @param {object} object - Object to validate
 * @returns {array | null} Errors
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
 * @param {object} IODOpts - IOD options
 * @returns {string | null} If missing required inputs
 */
exports.validateActionInputs = function(IOD, IODOpts) {
	var schema = IOD.schemas.schema[IODOpts.action].properties
	var inputs = _.pick(schema, ['text', 'file', 'reference', 'url', 'json'])
	var params = IODOpts.params || {}

	if (IODOpts.files) params.file = true

	if (!_.isEmpty(inputs) &&
		!_.intersection(_.keys(inputs), _.keys(params)).length) {
		return 'Missing one of the required inputs: ' + _.keys(inputs)
	}
	else if (IODOpts.params && IODOpts.files) delete IODOpts.params.file
}

/**
 * Maps validation types to validation method.
 */
var validationMap = {
	/**
	 * Validates IOD action schema along with their required inputs.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {object} IODOpts - IOD options object
	 * @returns {object | null} Schema errors
	 */
	action: function validateIODActions(IOD, IODOpts) {
		// Validate IOD action schema
		var actionErr = exports.validateWithPrettyErr(IOD, IODOpts.action,
			IODOpts.params || {})
		if (actionErr) return actionErr

		// Validate IOD action required inputs
		var inputErr = exports.validateActionInputs(IOD, IODOpts)
		if (inputErr) return inputErr
	},

	/**
	 * Validates IOD action schema for every action in job, along with their required inputs.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {object} IODOpts - IOD options object
	 * @returns {object | null} Schema errors
	 */
	job: function validateIODJob(IOD, IODOpts) {
		var job = IODOpts.job
		var errors = []

		_.each(job.actions, function(action) {
			// Validate every IOD action in job
			var err = exports.validateWithPrettyErr(IOD, action.name, action.params || {})
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
 * @param {object} IODOpts - IOD options
 * @param {string} apiType - IOD request type
 * @param {function} callback - Callback(err | null)
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