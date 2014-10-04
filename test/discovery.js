/**
 * Unit test for discovery apis.
 */

'use strict';

var _ = require('lodash')
var U = require('./utils')
var should = require('should')

var async = require('../lib/async-ext')
var apply = async.apply

describe('#IOD.DISCOVERY', function() {
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
							env.IOD.discovery(IODOpts, U.beforeDoneFn(env, 'one', done))
						},

						function two(done) {
							IODOpts = { majorVersion: 'invalid majorVersion' }
							env.IOD.discovery(IODOpts, U.beforeDoneFn(env, 'two', done))
						},

						function three(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								action: 'invalid action'
							}
							env.IOD.discovery(IODOpts, U.beforeDoneFn(env, 'three', done))
						},

						function four(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								action: env.IOD.ACTIONS.DISCOVERY.API,
								method: 'invalid method'
							}
							env.IOD.discovery(IODOpts, U.beforeDoneFn(env, 'three', done))
						}
					], callback)

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

					it('should have invalid method', function() {
						U.shouldError(this.schema.four)
						U.findSchemaMsgError(this.schema.four.error, 'enum', 'method')
					})
				})
			})

			describe('.api', function() {
				before(function(callback) {
					this.api = {}
					var env = this.api

					async.waterfall([
						apply(U.createIOD, i, env),

						function getApis(done) {
							env.IOD.discovery({
								action: env.IOD.ACTIONS.DISCOVERY.API
							}, U.beforeDoneFn(env, 'get', done))
						},

						function postApis(done) {
							env.IOD.discovery({
								method: 'post',
								action: env.IOD.ACTIONS.DISCOVERY.API
							}, U.beforeDoneFn(env, 'post', done))
						}
					], callback)
				})

				it('GET request should have gotten apis', function() {
					U.shouldBeSuccessful(this.api.get)
					_.isArray(this.api.get.response).should.be.true
					this.api.get.response.length.should.not.be.eql(0)
				})

				it('POST request should have gotten apis', function() {
					U.shouldBeSuccessful(this.api.post)
					_.isArray(this.api.post.response).should.be.true
					this.api.post.response.length.should.not.be.eql(0)
				})
			})
		})
	})
})