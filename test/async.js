/**
 * Unit test for IOD async request with analyzesentiment action.
 * global describe
 */

'use strict';

var _ = require('lodash')
var U = require('./utils')
var should = require('should')

var async = require('../lib/async-ext')
var apply = async.apply

describe('#IOD.ASYNC', function() {
	U.timeout(this)

	_.each(U.tests, function(test, i) {
		describe('#' + test.test, function() {
			describe('schema validation', function() {
				var IODOpts = {}

				before(function(callback) {
					this.schema = {}
					var env = this.schema

					async.waterfall([
						apply(U.createIOD, i, env),

						function one(done) {
							env.IOD.async(IODOpts, U.beforeDoneFn(env, 'one', done))
						},
						function two(done) {
							IODOpts = { majorVersion: 'invalid majorVersion' }
							env.IOD.async(IODOpts, U.beforeDoneFn(env, 'two', done))
						},
						function three(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								action: 'invalid action'
							}
							env.IOD.async(IODOpts, U.beforeDoneFn(env, 'three', done))
						},
						function four(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								action: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
								apiVersion: 'invalid api version'
							}
							env.IOD.async(IODOpts, U.beforeDoneFn(env, 'four', done))
						},
						function five(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								action: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
								apiVersion: env.IOD.VERSIONS.API.V1,
								method: 'invalid method'
							}
							env.IOD.async(IODOpts, U.beforeDoneFn(env, 'five', done))
						},
						function six(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								action: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
								apiVersion: env.IOD.VERSIONS.API.V1,
								method: 'get',
								params: 'string params'
							}
							env.IOD.async(IODOpts, U.beforeDoneFn(env, 'six', done))
						},
						function seven(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								action: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
								apiVersion: env.IOD.VERSIONS.API.V1,
								method: 'get',
								params: { text: '=)'},
								files: { key: 'not array' }
							}
							env.IOD.async(IODOpts, U.beforeDoneFn(env, 'seven', done))
						},
						function eight(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								action: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
								apiVersion: env.IOD.VERSIONS.API.V1,
								method: 'get',
								params: { text: '=)'},
								files: ['files'],
								getResults: 'not a boolean'
							}
							env.IOD.async(IODOpts, U.beforeDoneFn(env, 'eight', done))
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

				it('should have invalid action', function() {
					U.shouldError(this.schema.three)
					U.findSchemaMsgError(this.schema.three.error, 'enum', 'action')
				})

				it('should have invalid api version', function() {
					U.shouldError(this.schema.four)
					U.findSchemaMsgError(this.schema.four.error, 'enum', 'apiVersion')
				})

				it('should have invalid method', function() {
					U.shouldError(this.schema.five)
					U.findSchemaMsgError(this.schema.five.error, 'enum', 'method')
				})

				it('should have params type error', function() {
					U.shouldError(this.schema.six)
					U.findSchemaMsgError(this.schema.six.error, 'type', 'params')
				})

				it('should have files type error', function() {
					U.shouldError(this.schema.seven)
					U.findSchemaMsgError(this.schema.seven.error, 'type', 'files')
				})

				it('should have getResults type error', function() {
					U.shouldError(this.schema.eight)
					U.findSchemaMsgError(this.schema.eight.error, 'type', 'getResults')
				})
			})

			describe('with params', function() {
				var IODOpts = {
					params: { text: '=)'}
				}

				before(function(callback) {
					this.params = {}
					var env = this.params

					async.waterfall([
						apply(U.createIOD, i, env),

						function get(done) {
							_.defaults(IODOpts, {
								action: env.IOD.ACTIONS.API.ANALYZESENTIMENT
							})
							env.IOD.async(IODOpts, U.beforeDoneFn(env, 'get', done))
						},
						function getWithRes(done) {
							IODOpts.getResults = true
							env.IOD.async(IODOpts, U.beforeDoneFn(env, 'getWithRes', done))
						},
						function post(done) {
							IODOpts.getResults = false
							IODOpts.method = 'post'
							env.IOD.async(IODOpts, U.beforeDoneFn(env, 'post', done))
						},
						function postWithRes(done) {
							IODOpts.getResults = true
							env.IOD.async(IODOpts, U.beforeDoneFn(env, 'postWithRes', done))
						}
					], callback)
				})

				it('GET should be successful with jobId', function() {
					U.shouldBeSuccessful(this.params.get)
					U.shouldBeJobId(this.params.get)
				})

				it('GET should be successful with results', function() {
					U.shouldBeSuccessful(this.params.getWithRes)
					U.shouldHaveResults(this.params.getWithRes)
				})

				it('POST should be successful with jobId', function() {
					U.shouldBeSuccessful(this.params.post)
					U.shouldBeJobId(this.params.post)
				})

				it('POST should be successful with results', function() {
					U.shouldBeSuccessful(this.params.postWithRes)
					U.shouldHaveResults(this.params.postWithRes)
				})
			})

			describe('with files', function() {
				var IODOpts = {
					method: 'post',
					files: ['invalid file path']
				}

				before(function(callback) {
					this.files = {}
					var env = this.files

					async.waterfall([
						apply(U.createIOD, i, env),

						function one(done) {
							_.defaults(IODOpts, {
								action: env.IOD.ACTIONS.API.ANALYZESENTIMENT
							})

							env.IOD.async(IODOpts, U.beforeDoneFn(env, 'one', done))
						},
						function two(done) {
							IODOpts.files = [__dirname + '/files/test1.txt']
							env.IOD.async(IODOpts, U.beforeDoneFn(env, 'two', done))
						},
						function three(done) {
							IODOpts.getResults = true
							IODOpts.files = [__dirname + '/files/test1.txt']
							env.IOD.async(IODOpts, U.beforeDoneFn(env, 'three', done))
						}
					], callback)
				})

				it('should fail to open file', function() {
					U.shouldError(this.files.one)
					U.shouldContain(this.files.one.error, 'ENOENT')
				})

				it('should be successful with jobId', function() {
					U.shouldBeSuccessful(this.files.two)
					U.shouldBeJobId(this.files.two)
				})

				it('should be successful with results', function() {
					U.shouldBeSuccessful(this.files.three)
					U.shouldHaveResults(this.files.three)
				})
			})
		})
	})
})