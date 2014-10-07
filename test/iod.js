/**
 * Unit test for creating new instance of IOD.
 */

'use strict';

var U = require('./utils')
var IOD = require('../index')
var should = require('should')
var async = require('../lib/async-ext')

describe('#IOD', function() {
	U.timeout(this)
	var iod = new IOD(U.tests[0].apiKey)

	it('should be new instance of IOD', function() {
		should.exists(iod)
	})

	describe('.sync', function() {
		before(function(callback) {
			this.sync = {}
			var env = this.sync
			var IODOpts = { action: 'analyzesentiment' }

			async.waterfall([
				function syncError(done) {
					iod.sync(IODOpts, U.beforeDoneFn(env, 'err', done))
				},

				function syncSuccess(done) {
					IODOpts.params = { text: '=)' }
					iod.sync(IODOpts, U.beforeDoneFn(env, 'res', done))
				}
			], callback)
		})

		it('should get error from IDOL onDemand server', function() {
			U.shouldError(this.sync.err)
			this.sync.err.error.error.should.be.eql(4015)
		})

		it('should get successful response from IDOL onDemand server', function() {
			U.shouldBeSuccessful(this.sync.res)
			this.sync.res.response.should.have
				.properties('positive', 'negative', 'aggregate')
		})
	})

	describe('.async', function() {
		before(function(callback) {
			this.async = {}
			var env = this.async
			var IODOpts = { action: 'analyzesentiment' }

			async.waterfall([
				function asyncError(done) {
					iod.async(IODOpts, U.beforeDoneFn(env, 'err', done))
				},

				function asyncSuccess(done) {
					IODOpts.params = { text: '=)' }
					iod.async(IODOpts, U.beforeDoneFn(env, 'res', done))
				},

				function asyncResults(done) {
					IODOpts.getResults = true
					iod.async(IODOpts, U.beforeDoneFn(env, 'result', done))
				}
			], callback)
		})

		it('should get error from IDOL onDemand server', function() {
			U.shouldError(this.async.err)
			this.async.err.error.error.should.be.eql(4015)
		})

		it('should get successful jobId from IDOL onDemand server', function() {
			U.shouldBeSuccessful(this.async.res)
			U.shouldBeJobId(this.async.res)
		})

		it('should get successful response from IDOL onDemand server', function() {
			U.shouldBeSuccessful(this.async.result)
			U.shouldHaveResults(this.async.result)
		})
	})

	describe('.job', function() {
		before(function(callback) {
			this.job = {}
			var env = this.job
			var IODOpts = {
				job: {
					actions: [
						{
							name: 'analyzesentiment'
						},
						{
							name: 'analyzesentiment',
							params: { text: '=)' }
						}
					]
				}
			}

			async.waterfall([
				function jobError(done) {
					iod.job(IODOpts, U.beforeDoneFn(env, 'err', done))
				},

				function jobSuccess(done) {
					IODOpts.job.actions[0].params = { text: '=)' }
					iod.job(IODOpts, U.beforeDoneFn(env, 'res', done))
				},

				function jobResults(done) {
					IODOpts.getResults = true
					iod.job(IODOpts, U.beforeDoneFn(env, 'result', done))
				}
			], callback)
		})

		it('should get error from IDOL onDemand server', function() {
			U.shouldError(this.job.err)
			this.job.err.error.error.should.be.eql(4005)
		})

		it('should get successful jobId from IDOL onDemand server', function() {
			U.shouldBeSuccessful(this.job.res)
			U.shouldBeJobId(this.job.res)
		})

		it('should get successful response from IDOL onDemand server', function() {
			U.shouldBeSuccessful(this.job.result)
			U.shouldHaveMultResults(this.job.result)
		})
	})

	describe('.status', function() {
		before(function(callback) {
			this.status = {}
			var env = this.status

			async.waterfall([
				function asyncJobId(done) {
					var IODOpts = {
						action: 'analyzesentiment',
						params: { text: '=)' }
					}
					iod.async(IODOpts, U.beforeDoneFn(env, 'async', done))
				},

				function getStatus(done) {
					iod.status({ jobId: env.async.response.jobID },
						U.beforeDoneFn(env, 'status', done))
				}
			], callback)
		})

		it('should get successful jobId from IDOL onDemand server', function() {
			U.shouldBeSuccessful(this.status.async)
			U.shouldBeJobId(this.status.async)
		})

		it('should get successful status from IDOL onDemand server', function() {
			U.shouldBeSuccessful(this.status.status)
			U.shouldBeStatus(this.status.status)
		})
	})

	describe('.result', function() {
		before(function(callback) {
			this.result = {}
			var env = this.result

			async.waterfall([
				function asyncJobId(done) {
					var IODOpts = {
						action: 'analyzesentiment',
						params: { text: '=)' }
					}
					iod.async(IODOpts, U.beforeDoneFn(env, 'async', done))
				},

				function getResult(done) {
					iod.result({ jobId: env.async.response.jobID },
						U.beforeDoneFn(env, 'result', done))
				}
			], callback)
		})

		it('should get successful jobId from IDOL onDemand server', function() {
			U.shouldBeSuccessful(this.result.async)
			U.shouldBeJobId(this.result.async)
		})

		it('should get successful response from IDOL onDemand server', function() {
			U.shouldBeSuccessful(this.result.result)
			U.shouldHaveResults(this.result.result)
		})
	})
})
