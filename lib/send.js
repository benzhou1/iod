/**
 * Utilities for sending request.
 * @module lib/send
 */

'use strict';

var fs = require('fs')
var _ = require('lodash')
var IodU = require('./iod')
var T = require('./transform')
var request = require('request')

/**
 * Sends IOD request.
 * Automatically applies proxy depending on environment variables.
 * Automatically removes proxy for local addresses depending on environment variables.
 *
 * For 'multipart/form-data' use FormData object.
 * Api keys are automatically added to request.
 *
 * @param {IOD} IOD - IOD object
 * @param {Object} IODOpts - IOD options
 * @param {String} apiType - Api request type
 * @param {Object} [reqOpts] - Request options for current request
 * @param {Function} callback - Callback(err, IOD response)
 */
exports.send = function(IOD, IODOpts, apiType, reqOpts, callback) {
	// `reqOpts` is optional
	if (_.isFunction(reqOpts)) {
		callback = reqOpts
		reqOpts = {}
	}

	var _callback = _.once(callback)
	var options = makeOptions(IOD, IODOpts, apiType, reqOpts)

	/**
	 * Callback for handling request.
	 * Errors if response from IOD server is not 200.
	 * Attempts to JSON parse response body on success, returns original body if
	 * fail to parse.
	 *
	 * @param {*} err - Request error
	 * @param {Object} httpRes - Request http response object
	 * @param {*} body - Request body
	 */
	var reqCallback = function(err, httpRes, body) {
		if (err) _callback(err)
		else {
			try { var res = JSON.parse(body) }
			catch(err) { _callback(null, body) }

			if (httpRes && httpRes.statusCode !== 200) {
				maybeRetry(res, IOD, IODOpts, apiType, _callback)
			}
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
 * If retries is specified on `IODOpts` and is greater than one,
 * retry request if it is either a Backend failure or time out.
 *
 * @param {*} err - Error
 * @param {IOD} IOD - IOD object
 * @param {Object} IODOpts - IOD options
 * @param {String} apiType - Api type
 * @param {Function} callback - callback(err | res)
 */
function maybeRetry(err, IOD, IODOpts, apiType, callback) {
	var retryApiReq = apiType !== IOD.TYPES.SYNC &&
		apiType !== IOD.TYPES.RESULT &&
		apiType !== IOD.TYPES.DISCOVERY

	if (IODOpts.retries == null || retryApiReq) callback(err)
	else if (!--IODOpts.retries) callback(err)
	var reqTypeDontRetry =  apiType !== IOD.TYPES.SYNC &&
		apiType !== IOD.TYPES.DISCOVERY &&
		apiType !== IOD.TYPES.RESULT

	if (IODOpts.retries == null || reqTypeDontRetry) callback(err)
	else if (!IODOpts.retries--) callback(err)
	else {
		var errCode = err.error
		var errCodeList = T.maybeToArray(IODOpts.errorCodes)

		// Backend request failed or timed out
		if (errCode === 5000 || errCode === 7000 || _.contains(errCodeList, errCode)) {
			exports.send(IOD, IODOpts, apiType, callback)
		}
		else callback(err)
	}
}

/**
 * Creates a request options object with.
 *
 * @param {IOD} IOD - IOD object
 * @param {Object} IODOpts - IOD options
 * @param {String} apiType - IOD request type
 * @param {Object} reqOpts - Request options for current request
 * @returns {Object} Request options object
 */
function makeOptions(IOD, IODOpts, apiType, reqOpts) {
	var path = IodU.makePath(IOD, IODOpts, apiType)
	var method = apiType === IOD.TYPES.JOB || !_.isEmpty(IODOpts.files) ?
		'post' : IODOpts.method.toLowerCase()

	return _.defaults({
		url: IOD.host + ':' + IOD.port + path,
		path: path,
		method: method,

		// For 'get' request use request `qs` property.
		qs: method === 'get' ?
			_.defaults({ apiKey: IOD.apiKey }, exports.prepareParams(IODOpts.params)) : undefined,

		// For 'post' request with no files use `form` property
		form: method === 'post' && !IODOpts.files ?
			_.defaults({ apiKey: IOD.apiKey }, exports.prepareParams(IODOpts.params)) : undefined
	}, reqOpts, IOD.reqOpts)
}

/**
 * Add parameters to FormData object.
 * Automatically append api key.
 *
 * Modifies `IODOpts` in place.
 *
 * @param {IOD} IOD - IOD object
 * @param {Object} IODOpts - IOD options
 * @param {FormData} form - FormData object
 */
function addParamsToData(IOD, IODOpts, form) {
	form.append('apiKey', IOD.apiKey)

	_.each(exports.prepareParams(IODOpts.params), function(paramVal, paramName) {
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
 * @param {Object} IODOpts - IOD options
 * @param {String} apiType - IOD request type
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
 * @param {Object} params - IODOpts params
 * @returns {Object} - Prepared params
 */
exports.prepareParams = function(params) {
	if (!params) return {}
	else return _.mapValues(params, T.toString)
}