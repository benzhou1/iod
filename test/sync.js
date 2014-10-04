/**
 * Unit test for IOD sync request.
 */

'use strict';

var U = require('./utils')
var _ = require('lodash')
var should = require('should')

var async = require('../lib/async-ext')
var apply = async.apply

describe('IOD.SYNC', function() {
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
							env.IOD.sync(IODOpts, U.beforeDoneFn(env, 'one', done))
						},
						function two(done) {
							IODOpts = { majorVersion: 'invalid majorVersion' }
							env.IOD.sync(IODOpts, U.beforeDoneFn(env, 'two', done))
						},
						function three(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								action: 'invalid action'
							}
							env.IOD.sync(IODOpts, U.beforeDoneFn(env, 'three', done))
						},
						function four(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								action: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
								apiVersion: 'invalid api version'
							}
							env.IOD.sync(IODOpts, U.beforeDoneFn(env, 'four', done))
						},
						function five(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								action: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
								apiVersion: env.IOD.VERSIONS.API.V1,
								method: 'invalid method'
							}
							env.IOD.sync(IODOpts, U.beforeDoneFn(env, 'five', done))
						},
						function six(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								action: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
								apiVersion: env.IOD.VERSIONS.API.V1,
								method: 'get',
								params: 'string params'
							}
							env.IOD.sync(IODOpts, U.beforeDoneFn(env, 'six', done))
						},
						function seven(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								action: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
								apiVersion: env.IOD.VERSIONS.API.V1,
								method: 'get',
								params: { text: '=)'},
								files: {}
							}
							env.IOD.sync(IODOpts, U.beforeDoneFn(env, 'seven', done))
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
							env.IOD.sync(IODOpts, U.beforeDoneFn(env, 'get', done))
						},
						function post(done) {
							IODOpts.method = 'post'
							env.IOD.sync(IODOpts, U.beforeDoneFn(env, 'post', done))
						}
					], callback)
				})

				it('GET should be successful', function() {
					U.shouldBeSuccessful(this.params.get)
					this.params.get.response.should.have
						.properties('positive', 'negative', 'aggregate')
				})

				it('POST should be successful', function() {
					U.shouldBeSuccessful(this.params.post)
					this.params.post.response.should.have
						.properties('positive', 'negative', 'aggregate')
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
							env.IOD.sync(IODOpts, U.beforeDoneFn(env, 'one', done))
						},
						function two(done) {
							IODOpts.files = [__dirname + '/files/test1.txt']
							env.IOD.sync(IODOpts, U.beforeDoneFn(env, 'two', done))
						}
					], callback)
				})

				it('should fail to open file', function() {
					U.shouldError(this.files.one)
					U.shouldContain(this.files.one.error, 'ENOENT')
				})

				it('should be successful', function() {
					U.shouldBeSuccessful(this.files.two)
					this.files.two.response.should.have
						.properties('positive', 'negative', 'aggregate')
				})
			})
		})
	})
})