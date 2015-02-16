/**
 * Unit tests for retries on specific error codes.
 */

'use strict';

var _ = require('lodash')
var U = require('./utils')
var sinon = require('sinon')
var should = require('should')
var SendU = require('../lib/send')
var async = require('../lib/async-ext')

var reqTypes = [U.IOD.TYPES.SYNC, U.IOD.TYPES.DISCOVERY]
var tests = ['[CREATE IOD]', '[NEW IOD]']

_.each(tests, function(test) {
	_.each(reqTypes, function(type) {
		describe(test + '[' + type + ']', function() {
			retryTests(type, test)
		})
	})
})

function retryTests(reqType, test) {
	describe('#RETRY', function() {
		U.timeout(this)

		before(function(callback) {
			this.retry = {}
			var env = this.retry

			var beforeFn = function(IOD) {
				var retries = {
					retries: 2,
					errorCodes: [4006, 8002]
				}

				async.series([
					function retryingTwice4006(done) {
						sinon.spy(SendU, 'send')
						var IODOpts = _.defaults({
							action: 'connectorstatus',
							params: { connector: 'invalid' }
						}, retries)

						IOD.sync(IODOpts, U.beforeDoneFn(env, 'retry24006',
							async.doneFn(done, function() {
								env.retry24006.tries = SendU.send.callCount
								SendU.send.restore()
							}))
						)
					},

					function retryingTwice8002(done) {
						sinon.spy(SendU, 'send')
						var IODOpts = _.defaults({
							action: 'indexstatus',
							params: { index: 'invalid' }
						}, retries)

						IOD.sync(IODOpts, U.beforeDoneFn(env, 'retry28002',
							async.doneFn(done, function() {
								env.retry28002.tries = SendU.send.callCount
								SendU.send.restore()
							}))
						)
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

		it('Should have tried 2 times on 4006 error code', function() {
			should.exists(this.retry.retry24006.error)
			this.retry.retry24006.tries.should.be.eql(3)
		})

		it('Should have tried 2 times on 8002 error code', function() {
			should.exists(this.retry.retry28002.error)
			this.retry.retry28002.tries.should.be.eql(3)
		})
	})
}