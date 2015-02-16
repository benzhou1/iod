/**
 * Unit tests for callbacks and events.
 */

'use strict';

var _ = require('lodash')
var U = require('./utils')
var should = require('should')
var multer = require('multer')
var express = require('express')
var bodyParser = require('body-parser')
var async = require('../lib/async-ext')

var reqTypes = [U.IOD.TYPES.ASYNC, U.IOD.TYPES.JOB]
var tests = ['[CREATE IOD]', '[NEW IOD]']

_.each(tests, function(test) {
	_.each(reqTypes, function(type) {
		describe(test + '[' + type + ']', function() {
			callbackTests(type, test)
			eventTests(type, test)
		})
	})
})

/**
 * Testing callbacks feature.
 *
 * @param {String} reqType - IOD request type
 * @param {String} test - Current test string
 */
function callbackTests(reqType, test) {
	/**
	 * Sets up express server to listen to callback results.
	 *
	 * @param {IOD} IOD - IOD object
	 * @param {Boolean} shouldError - True for callback to return error
	 * @param {Function} callback - Callback(err, res)
	 */
	var listenAndClose = function(IOD, shouldError, callback) {
		var listener = function(err) {
			server.close()
			callback(err)
		}

		var app = express()
		app.use(bodyParser.json())
		app.use(bodyParser.urlencoded({ extended: true }))
		app.use(multer())
		app.post('/', function(req, res) {
			if (shouldError) {
				res.status(400).send('ERROR')
			}
			else {
				res.send('Hello world!')
				server.close()
				IOD.eventEmitter.removeListener('CbError', listener)
				callback(null, JSON.parse(req.body.results))
			}
		})
		var server = app.listen(3333)

		IOD.eventEmitter.once('CbError', listener)
	}

	describe('#CALLBACKS', function() {
		U.timeout(this)

		before(function(callback) {
			this.cbt = {}
			var env = this.cbt

			var beforeFn = function(IOD) {
				var transformIODOpts = function(IODOpts, def) {
					if (reqType === IOD.TYPES.JOB) {
						return IOD.IODOptsToJob(IODOpts, def)
					}
					else return _.defaults({}, def, IODOpts)
				}

				async.waterfall([
					function successfullyGetResultsEncoded(done) {
						var IODOpts = { action: 'analyzesentiment', params: { text: '=)' } }
						var def = { callback: { uri: 'http://localhost:3333' } }

						IOD[reqType](transformIODOpts(IODOpts, def), function(err) {
							if (err) done(err)
						})

						listenAndClose(IOD, false, U.beforeDoneFn(env, 'encoded', done))
					},

					function successfullyGetResultsMultipart(done) {
						var IODOpts = { action: 'analyzesentiment', params: { text: '=)' } }
						var def = {
							callback: { uri: 'http://localhost:3333', method: 'multipart' }
						}

						IOD[reqType](transformIODOpts(IODOpts, def), function(err) {
							if (err) done(err)
						})

						listenAndClose(IOD, false, U.beforeDoneFn(env, 'multipart', done))
					},

					function callbackError(done) {
						var IODOpts = { action: 'analyzesentiment', params: { text: '=)' } }
						var def = { callback: { uri: 'http://unknown_host' } }

						IOD[reqType](transformIODOpts(IODOpts, def), function(err) {
							if (err) done(err)
						})

						listenAndClose(IOD, false, U.beforeDoneFn(env, 'error', done))
					},

					function callbackReturnsError(done) {
						var IODOpts = { action: 'analyzesentiment', params: { text: '=)' } }
						var def = { callback: { uri: 'http://localhost:3333' } }

						IOD[reqType](transformIODOpts(IODOpts, def), function(err) {
							if (err) done(err)
						})

						listenAndClose(IOD, true, U.beforeDoneFn(env, 'retError', done))
					}
				], callback)
			}

			if (test === tests[1]) beforeFn(U.IOD)
			else {
				U.createIOD(function(err, IOD) {
					beforeFn(IOD)
				})
			}
		})

		it('Should have successfully gotten results through callback with encoded method',
			function() {
				U.shouldBeSuccessful(this.cbt.encoded)
				U.shouldHaveResults('analyzesentiment', this.cbt.encoded)
			}
		)

		it('Should have successfully gotten results through callback with multipart method',
			function() {
				U.shouldBeSuccessful(this.cbt.multipart)
				U.shouldHaveResults('analyzesentiment', this.cbt.multipart)
			}
		)

		it('Should fail with callback error', function() {
			U.shouldError(this.cbt.error)
		})

		it('Should fail with callback error if callback sends non 200 status', function() {
			U.shouldError(this.cbt.retError)
		})
	})
}

/**
 * Testing events feature.
 *
 * @param {String} reqType - IOD request type
 * @param {String} test - Current test string
 */
function eventTests(reqType, test) {
	describe('#EVENTS', function() {
		U.timeout(this)

		before(function(callback) {
			this.ev = {}
			var env = this.ev

			var beforeFn = function(IOD) {
				async.waterfall([
					function listenForFinishedEvent(done) {
						var IODOpts = { action: 'analyzesentiment', params: { text: '=)' } }
						if (reqType === U.IOD.TYPES.JOB) IODOpts = U.IOD.IODOptsToJob(IODOpts)

						IOD[reqType](IODOpts, function(err, res) {
							if (err) done(err)
							else if (!res || !res.jobID) done(res)
							else {
								IOD.eventEmitter.once(res.jobID,
									U.beforeDoneFn(env, 'success', done))
							}
						})
					},

					function listenForFinishedEventError(done) {
						var IODOpts = {
							action: 'connectorstatus',
							params: { connector: 'invalid' }
						}
						if (reqType === U.IOD.TYPES.JOB) IODOpts = U.IOD.IODOptsToJob(IODOpts)

						IOD[reqType](IODOpts, function(err, res) {
							if (err) done(err)
							else if (!res || !res.jobID) done(res)
							else {
								var timeout = IOD.reqOpts.timeout
								IOD.reqOpts.timeout = 1
								IOD.eventEmitter.once(res.jobID, function(err, res) {
									IOD.reqOpts.timeout = timeout
									U.beforeDoneFn(env, 'error', done)(err, res)
								})
							}
						})
					},

					function listenForLongFinishedEvent(done) {
						var IODOpts = {
							action: 'recognizespeech',
							files: [__dirname + '/files/recognizespeech'],
							pollInterval: 1000
						}
						if (reqType === U.IOD.TYPES.JOB) IODOpts = U.IOD.IODOptsToJob(IODOpts)

						IOD[reqType](IODOpts, function(err, res) {
							if (err) done(err)
							else if (!res || !res.jobID) done(res)
							else {
								IOD.eventEmitter.once(res.jobID,
									U.beforeDoneFn(env, 'long', done))
							}
						})
					}
				], callback)
			}

			if (test === tests[1]) beforeFn(U.IOD)
			else {
				U.createIOD(function(err, IOD) {
					beforeFn(IOD)
				})
			}
		})

		it('Should have gotten results from finished event', function() {
			U.shouldHaveResults('analyzesentiment', this.ev.success)
		})

		it('Should have gotten error from finished event', function() {
			U.shouldError(this.ev.error)
		})

		it('Should have gotten results from a long finished event', function() {
			U.shouldHaveResults('recognizespeech', this.ev.long)
		})
	})
}