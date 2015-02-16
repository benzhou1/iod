/**
 * Unit test for creating new instance of IOD.
 */

'use strict';

var U = require('./utils')
var should = require('should')
var async = require('../lib/async-ext')

describe('#IOD', function() {
	U.timeout(this)

	it('should be new instance of IOD', function(callback) {
		U.createIOD(function() {
			should.exists(U.IOD)
			callback()
		})
	})

	describe('.sync', function() {
		before(function(callback) {
			this.sync = {}
			var env = this.sync
			var IODOpts = { action: 'analyzesentiment' }

			async.waterfall([
				function syncError(done) {
					U.IOD.sync(IODOpts, U.beforeDoneFn(env, 'err', done))
				},

				function syncSuccess(done) {
					IODOpts.params = { text: '=)' }
					U.IOD.sync(IODOpts, U.beforeDoneFn(env, 'res', done))
				},

				function overrideReqOpts(done) {
					U.IOD.sync(IODOpts, { timeout: 1 }, U.beforeDoneFn(env, 'timeout', done))
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

		it('should timeout from overriding reqOpts', function() {
			U.shouldError(this.sync.timeout)
		})
	})

	describe('.async', function() {
		before(function(callback) {
			this.async = {}
			var env = this.async
			var IODOpts = { action: 'analyzesentiment' }

			async.waterfall([
				function asyncError(done) {
					U.IOD.async(IODOpts, U.beforeDoneFn(env, 'err', done))
				},

				function asyncSuccess(done) {
					IODOpts.params = { text: '=)' }
					U.IOD.async(IODOpts, U.beforeDoneFn(env, 'res', done))
				},

				function asyncResults(done) {
					IODOpts.getResults = true
					U.IOD.async(IODOpts, U.beforeDoneFn(env, 'result', done))
				},

				function overrideReqOpts(done) {
					U.IOD.async(IODOpts, { timeout: 1 }, U.beforeDoneFn(env, 'timeout', done))
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
			U.shouldHaveResults('analyzesentiment', this.async.result)
		})

		it('should timeout from overriding reqOpts', function() {
			U.shouldError(this.async.timeout)
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
					U.IOD.job(IODOpts, U.beforeDoneFn(env, 'err', done))
				},

				function jobSuccess(done) {
					IODOpts.job.actions[0].params = { text: '=)' }
					U.IOD.job(IODOpts, U.beforeDoneFn(env, 'res', done))
				},

				function jobResults(done) {
					IODOpts.getResults = true
					U.IOD.job(IODOpts, U.beforeDoneFn(env, 'result', done))
				},

				function overrideReqOpts(done) {
					U.IOD.job(IODOpts, { timeout: 1 }, U.beforeDoneFn(env, 'timeout', done))
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
			U.shouldHaveResults('analyzesentiment', this.job.result)
		})

		it('should timeout from overriding reqOpts', function() {
			U.shouldError(this.job.timeout)
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
					U.IOD.async(IODOpts, U.beforeDoneFn(env, 'async', done))
				},

				function getStatus(done) {
					U.IOD.status({ jobId: env.async.response.jobID },
						U.beforeDoneFn(env, 'status', done))
				},

				function overrideReqOpts(done) {
					U.IOD.status({ jobId: env.async.response.jobID }, { timeout: 1 },
						U.beforeDoneFn(env, 'timeout', done))
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

		it('should timeout from overriding reqOpts', function() {
			U.shouldError(this.status.timeout)
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
					U.IOD.async(IODOpts, U.beforeDoneFn(env, 'async', done))
				},

				function getResult(done) {
					U.IOD.result({ jobId: env.async.response.jobID },
						U.beforeDoneFn(env, 'result', done))
				},

				function overrideReqOpts(done) {
					U.IOD.result({ jobId: env.async.response.jobID }, { timeout: 1 },
						U.beforeDoneFn(env, 'timeout', done))
				}
			], callback)
		})

		it('should get successful jobId from IDOL onDemand server', function() {
			U.shouldBeSuccessful(this.result.async)
			U.shouldBeJobId(this.result.async)
		})

		it('should get successful response from IDOL onDemand server', function() {
			U.shouldBeSuccessful(this.result.result)
			U.shouldHaveResults('analyzesentiment', this.result.result)
		})

		it('should timeout from overriding reqOpts', function() {
			U.shouldError(this.result.timeout)
		})
	})

	describe('.discovery', function() {
		before(function(callback) {
			this.dis = {}
			var env = this.dis
			var IODOpts = { action: 'api' }

			async.waterfall([
				function discoverySuccess(done) {
					U.IOD.discovery(IODOpts, U.beforeDoneFn(env, 'res', done))
				},

				function overrideReqOpts(done) {
					U.IOD.discovery(IODOpts, { timeout: 1 }, U.beforeDoneFn(env, 'timeout', done))
				}
			], callback)
		})

		it('should get successful response from IDOL onDemand server', function() {
			U.shouldBeSuccessful(this.dis.res)
			this.dis.res.response.should.be.an.array
		})

		it('should timeout from overriding reqOpts', function() {
			U.shouldError(this.dis.timeout)
		})
	})

	// TODO: Allow multiple files in a job action
//	describe('.IODOptsToJob', function() {
//		it('Should throw if any IODOpts is invalid', function() {
//			var validIODOpts = { action: 'listresources' }
//			var IODOptsList = [validIODOpts, validIODOpts, {}, validIODOpts]
//
//			try {
//				U.IOD.IODOptsToJob(IODOptsList)
//				false.should.be.true
//			}
//			catch(err) {
//				true.should.be.true
//			}
//		})
//
//		it('Should be valid `JOB` api type IODOpts', function() {
//			var IODOpts = { action: 'listresources' }
//			var IODOptsList = [IODOpts, IODOpts, IODOpts]
//			var jobIODOpts = U.IOD.IODOptsToJob(IODOptsList)
//			var errors = U.IOD.schemas.validate(U.IOD.TYPES.JOB, jobIODOpts)
//
//			should.not.exists(errors)
//
//			jobIODOpts.job.actions[0].should.be.eql({
//				name: IODOpts.action,
//				version: U.IOD.VERSIONS.API.V1,
//				params: {}
//			})
//		})
//
//		it('Should be valid single `JOB` api type IODOpts', function() {
//			var IODOpts = { action: 'listresources' }
//			var jobIODOpts = U.IOD.IODOptsToJob(IODOpts)
//			var errors = U.IOD.schemas.validate(U.IOD.TYPES.JOB, jobIODOpts)
//
//			should.not.exists(errors)
//
//			jobIODOpts.job.actions[0].should.be.eql({
//				name: IODOpts.action,
//				version: U.IOD.VERSIONS.API.V1,
//				params: {}
//			})
//		})
//
//		it('Should be valid `JOB` api type IODOpts with single file', function() {
//			var IODOpts = { action: 'extracttext' }
//			var IODOptsList = [
//				_.defaults({ files: ['filePath1'] }, IODOpts),
//				_.defaults({ files: ['filePath2'] }, IODOpts),
//				_.defaults({ files: ['filePath3'] }, IODOpts)
//			]
//			var jobIODOpts = U.IOD.IODOptsToJob(IODOptsList)
//			var errors = U.IOD.schemas.validate(U.IOD.TYPES.JOB, jobIODOpts)
//
//			should.not.exists(errors)
//
//			jobIODOpts.files[0].should.be.eql({ name: 'file1', path: 'filePath1' })
//			jobIODOpts.files[1].should.be.eql({ name: 'file2', path: 'filePath2' })
//
//			jobIODOpts.job.actions[0].should.be.eql({
//				name: IODOpts.action,
//				version: U.IOD.VERSIONS.API.V1,
//				params: { file: 'file1' }
//			})
//			jobIODOpts.job.actions[1].should.be.eql({
//				name: IODOpts.action,
//				version: U.IOD.VERSIONS.API.V1,
//				params: { file: 'file2' }
//			})
//		})
//
//		it('Should be valid `JOB` api type IODOpts with multiple file', function() {
//			var IODOpts = { action: 'extracttext' }
//			var IODOptsList = [
//				_.defaults({ files: ['filePath1', 'filePath2', 'filePath3'] }, IODOpts),
//				_.defaults({ files: ['filePath4', 'filePath5'] }, IODOpts),
//				_.defaults({ files: ['filePath6', 'filePath7'] }, IODOpts)
//			]
//			var jobIODOpts = U.IOD.IODOptsToJob(IODOptsList)
//			var errors = U.IOD.schemas.validate(U.IOD.TYPES.JOB, jobIODOpts)
//
//			should.not.exists(errors)
//
//			jobIODOpts.files[0].should.be.eql({ name: 'file1', path: 'filePath1' })
//			jobIODOpts.files[1].should.be.eql({ name: 'file2', path: 'filePath2' })
//			jobIODOpts.files[2].should.be.eql({ name: 'file3', path: 'filePath3' })
//			jobIODOpts.files[3].should.be.eql({ name: 'file4', path: 'filePath4' })
//			jobIODOpts.files[4].should.be.eql({ name: 'file5', path: 'filePath5' })
//
//			jobIODOpts.job.actions[0].should.be.eql({
//				name: IODOpts.action,
//				version: U.IOD.VERSIONS.API.V1,
//				params: { file: ['file1', 'file2', 'file3'] }
//			})
//			jobIODOpts.job.actions[1].should.be.eql({
//				name: IODOpts.action,
//				version: U.IOD.VERSIONS.API.V1,
//				params: { file: ['file4', 'file5'] }
//			})
//		})
//
//		it('Should override `JOB` api type IODOpts', function() {
//			var IODOpts = { action: 'listresources' }
//			var job = {
//				majorVersion: U.IOD.VERSIONS.MAJOR.V1,
//				job: { actions: [{ name: 'listresources' }] },
//				getResults: true,
//				pollInterval: 1000,
//				callback: { uri: 'http://www.google.com' }
//			}
//			var jobIODOpts = U.IOD.IODOptsToJob(IODOpts, job)
//			var errors = U.IOD.schemas.validate(U.IOD.TYPES.JOB, jobIODOpts)
//
//			should.not.exists(errors)
//
//			jobIODOpts.should.be.eql(job)
//		})
//	})
})
