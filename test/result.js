/**
 * Unit test for IOD result request.
 */

'use strict';

var U = require('./utils')
var _ = require('lodash')
var should = require('should')

var async = require('../lib/async-ext')
var apply = async.apply

describe('#IOD.RESULT', function() {
	U.timeout(this)

	_.each(U.tests, function(test, i) {
		describe('#' + test.test, function() {
			describe('schema validation', function() {
				before(function(callback) {
					this.schema = {}
					var env = this.schema
					var IODOpts = {}

					async.waterfall([
						apply(U.createIOD, i, env),

						function one(done) {
							env.IOD.result(IODOpts, U.beforeDoneFn(env, 'one', done))
						},
						function two(done) {
							IODOpts = { majorVersion: 'invalid majorVersion' }
							env.IOD.result(IODOpts, U.beforeDoneFn(env, 'two', done))
						},
						function three(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								method: 'invalid method'
							}
							env.IOD.result(IODOpts, U.beforeDoneFn(env, 'three', done))
						},
						function four(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								method: 'get',
								jobId: {}
							}
							env.IOD.result(IODOpts, U.beforeDoneFn(env, 'four', done))
						}
					], callback)
				})

				it('should contain errors', function() {
					U.shouldError(this.schema.one)
				})

				it('should have invalid major version', function() {
					U.shouldError(this.schema.two)
					U.findSchemaMsgError(this.schema.two.error, 'enum', 'majorVersion')
				})

				it('should have invalid method', function() {
					U.shouldError(this.schema.three)
					U.findSchemaMsgError(this.schema.three.error, 'enum', 'method')
				})

				it('should have jobId type error', function() {
					U.shouldError(this.schema.four)
					U.findSchemaMsgError(this.schema.four.error, 'type', 'jobId')
				})
			})

			describe('get result', function() {
				before(function(callback) {
					this.status = {}
					var env = this.status
					var asyncIODOpts = {
						params: { text: '=)' }
					}
					var statusIODOpts = {}

					async.waterfall([
						apply(U.createIOD, i, env),

						function async(done) {
							_.defaults(asyncIODOpts, {
								action: env.IOD.ACTIONS.API.ANALYZESENTIMENT
							})
							env.IOD.async(asyncIODOpts, U.beforeDoneFn(env, 'async', done))
						},
						function get(done) {
							var jobId = env.async.response && env.async.response.jobID
							if (!jobId) done()
							else {
								statusIODOpts.jobId = jobId
								env.IOD.result(statusIODOpts, U.beforeDoneFn(env, 'get', done))
							}
						},
						function post(done) {
							var jobId = env.async.response && env.async.response.jobID
							if (!jobId) done()
							else {
								statusIODOpts.method = 'post'
								statusIODOpts.jobId = jobId
								env.IOD.result(statusIODOpts, U.beforeDoneFn(env, 'post', done))
							}
						}
					], callback)
				})

				it('should be successful with jobId', function() {
					U.shouldBeSuccessful(this.status.async)
					U.shouldBeJobId(this.status.async)
				})

				it('GET should be successful with status', function() {
					U.shouldBeSuccessful(this.status.get)
					U.shouldHaveResults(this.status.get)
				})

				it('POST should be successful with status', function() {
					U.shouldBeSuccessful(this.status.post)
					U.shouldHaveResults(this.status.post)
				})
			})
		})
	})
})