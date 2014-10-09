/**
 * Utilities for sending request.
 * @module lib/send
 */

'use strict';

var fs = require('fs')
var url = require('url')
var _ = require('lodash')
var IodU = require('./iod')
var T = require('./transform')
var request = require('request')
var async = require('./async-ext')
var wildcard = require('wildcard')

/**
 * Sends IOD request.
 * Automatically applies proxy depending on environment variables.
 * Automatically removes proxy for local addresses depending on environment variables.
 *
 * For 'multipart/form-data' use FormData object.
 * Api keys are automatically added to request.
 *
 * @param {IOD} IOD - IOD object
 * @param {object} IODOpts - IOD options
 * @param {string} apiType - Api request type
 * @param {function} callback - Callback(err, IOD response)
 */
exports.send = function(IOD, IODOpts, apiType, callback) {
	var _callback = _.once(callback)
	var options = makeOptions(IOD, IODOpts, apiType)

	/**
	 * Callback for handling request.
	 * Errors if response from IOD server is not 200.
	 * Attempts to JSON parse response body on success, returns original body if
	 * fail to parse.
	 *
	 * @param {*} err - Request error
	 * @param {object} httpRes - Request http response object
	 * @param {*} body - Request body
	 */
	var reqCallback = function(err, httpRes, body) {
		if (err) _callback(err)
		else {
			try { var res = JSON.parse(body) }
			catch(err) { _callback(null, body) }

			if (httpRes && httpRes.statusCode !== 200) _callback(res)
			else _callback(null, res)
		}
	}

	if (options.method === 'get') request(options, reqCallback)
	// 'post' request
	else {
		// If files exists, send multipart/form-data using formData object
		if (IODOpts.files && !_.isEmpty(IODOpts.files)) {
			var r = request.post(options, reqCallback)
			var form = r.form()

			addParamsToData(IOD, IODOpts, form)
			addFilesToData(IOD, IODOpts, apiType, form)

			form.on('error', function(err) {
				_callback('IOD action request failed: ' + err)
			})
		}
		// Otherwise send application/x-www-form-urlencoded
		else request.post(options, reqCallback)
	}
}

/**
 * Checks environment variable `NO_PROXY`. If specified hostname is listed then remove
 * proxy from options.
 *
 * Modifies `options` in place.
 *
 * @param {object} options - Request options
 * @param {string} hostname - Host name
 */
exports.ensureIfNoProxy = function(options, hostname) {
	var urlObj = url.parse(hostname, false, true)
	var noProxy = process.env.NO_PROXY || process.env.no_proxy
	if (noProxy) {
		_.each(noProxy.split(','), function(host) {
			if (wildcard(host, urlObj.hostname)) {
				options.proxy = undefined
				return false
			}
		})
	}
}

/**
 * Creates a request options object with.
 *
 * @param {IOD} IOD - IOD object
 * @param {object} IODOpts - IOD options
 * @param {string} apiType - IOD request type
 * @returns {object} Request options object
 */
function makeOptions(IOD, IODOpts, apiType) {
	var path = IodU.makePath(IOD, IODOpts, apiType)
	var method = apiType === IOD.TYPES.JOB || !_.isEmpty(IODOpts.files) ?
		'post' : IODOpts.method.toLowerCase()

	var defOptions = {
		timeout: 20000
	}

	var options = _.defaults({
		url: IOD.host + ':' + IOD.port + path,
		path: path,
		method: method,

		// For 'get' request use request `qs` property.
		qs: method === 'get' ?
			_.defaults({ apiKey: IOD.apiKey }, prepareParams(IODOpts.params)) : undefined,

		// For 'post' request with no files use `form` property
		form: method === 'post' && !IODOpts.files ?
			_.defaults({ apiKey: IOD.apiKey }, prepareParams(IODOpts.params)) : undefined
	}, defOptions)

	// If proxy is found in `no_proxy` environment variable remove proxy
	exports.ensureIfNoProxy(options, IOD.host)
	return options
}

/**
 * Add parameters to FormData object.
 * Automatically append api key.
 *
 * Modifies `IODOpts` in place.
 *
 * @param {IOD} IOD - IOD object
 * @param {object} IODOpts - IOD options
 * @param {FormData} form - FormData object
 */
function addParamsToData(IOD, IODOpts, form) {
	form.append('apiKey', IOD.apiKey)

	_.each(IODOpts.params, function(paramVal, paramName) {
		_.each(T.maybeToArray(paramVal), function(val) {
			form.append(paramName, val)
		})
	})
}

/**
 * Add files to FormData object.
 *
 * Modifies `IODOpts` in place.
 *
 * @param {IOD} IOD - IOD object
 * @param {object} IODOpts - IOD options
 * @param {string} apiType - IOD request type
 * @param {FormData} form - FormData object
 */
function addFilesToData(IOD, IODOpts, apiType, form) {
	_.each(T.maybeToArray(IODOpts.files), function(file) {
		if (apiType === IOD.TYPES.JOB) {
			form.append(file.name, fs.createReadStream(file.path))
		}
		else form.append('file', fs.createReadStream(file))
	})
}

/**
 * Prepare each parameter, by converting each one into a string.
 * Arrays are left alone.
 *
 * @param {object} params - IODOpts params
 * @returns {object} - Prepared params
 */
function prepareParams(params) {
	if (!params) return {}
	else return _.mapValues(params, T.toString)
}