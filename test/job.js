/**
 * Unit test for IOD job request.
 */

'use strict';

var _ = require('lodash')
var U = require('./utils')
var should = require('should')

var async = require('../lib/async-ext')
var apply = async.apply

describe('#IOD.JOB', function() {
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
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'one', done))
						},
						function two(done) {
							IODOpts = { majorVersion: 'invalid majorVersion' }
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'two', done))
						},
						function three(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								job: {}
							}
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'three', done))
						},
						function four(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								job: { actions: 'not an array' }
							}
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'four', done))
						},
						function five(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								job: { actions: [{ name: 'invalid action' }] }
							}
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'five', done))
						},
						function six(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								job: { actions: [
									{
										name: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
										version: 'invalid version'
									}
								] }
							}
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'six', done))
						},
						function seven(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								job: { actions: [
									{
										name: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
										version: env.IOD.VERSIONS.API.V1,
										params: 'not an object'
									}
								] }
							}
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'seven', done))
						},
						function eight(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								job: {
									actions: [
										{
											name: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
											version: env.IOD.VERSIONS.API.V1,
											params: { text: '=)' }
										}
									]
								},
								getResults: 'not a boolean'
							}
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'eight', done))
						},
						function nine(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								job: {
									actions: [
										{
											name: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
											version: env.IOD.VERSIONS.API.V1,
											params: { text: '=)' }
										}
									]
								},
								getResults: false,
								files: 'string'
							}
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'nine', done))
						},
						function ten(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								job: {
									actions: [
										{
											name: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
											version: env.IOD.VERSIONS.API.V1,
											params: { text: '=)' }
										}
									]
								},
								getResults: false,
								files: [{}]
							}
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'ten', done))
						},
						function eleven(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								job: {
									actions: [
										{
											name: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
											version: env.IOD.VERSIONS.API.V1,
											params: { text: '=)' }
										}
									]
								},
								getResults: false,
								files: [{ name: {} }]
							}
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'eleven', done))
						},
						function twelve(done) {
							IODOpts = {
								majorVersion: env.IOD.VERSIONS.MAJOR.V1,
								job: {
									actions: [
										{
											name: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
											version: env.IOD.VERSIONS.API.V1,
											params: { text: '=)' }
										}
									]
								},
								getResults: false,
								files: [{ name: 'file', path: {} }]
							}
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'twelve', done))
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

				it('should have missing required actions', function() {
					U.shouldError(this.schema.three)
					U.findSchemaMsgError(this.schema.three.error, 'required', 'actions')
				})

				it('should have actions type error', function() {
					U.shouldError(this.schema.four)
					U.findSchemaMsgError(this.schema.four.error, 'type', 'actions')
				})

				it('should have invalid name', function() {
					U.shouldError(this.schema.five)
					U.findSchemaMsgError(this.schema.five.error, 'enum', 'name')
				})

				it('should have invalid api version', function() {
					U.shouldError(this.schema.six)
					U.findSchemaMsgError(this.schema.six.error, 'enum', 'version')
				})

				it('should have params type error', function() {
					U.shouldError(this.schema.seven)
					U.findSchemaMsgError(this.schema.seven.error, 'type', 'params')
				})

				it('should have getResults type error', function() {
					U.shouldError(this.schema.eight)
					U.findSchemaMsgError(this.schema.eight.error, 'type', 'getResults')
				})

				it('should have files type error', function() {
					U.shouldError(this.schema.nine)
					U.findSchemaMsgError(this.schema.nine.error, 'type', 'files')
				})

				it('should have missing required name', function() {
					U.shouldError(this.schema.ten)
					U.findSchemaMsgError(this.schema.ten.error, 'required', 'name')
				})

				it('should have name type error', function() {
					U.shouldError(this.schema.eleven)
					U.findSchemaMsgError(this.schema.eleven.error, 'type', 'name')
				})

				it('should have path type error', function() {
					U.shouldError(this.schema.twelve)
					U.findSchemaMsgError(this.schema.twelve.error, 'type', 'path')
				})
			})

			describe('with params', function() {
				before(function(callback) {
					this.params = {}
					var env = this.params
					var IODOpts = {}

					async.waterfall([
						apply(U.createIOD, i, env),

						function withoutRes(done) {
							_.defaults(IODOpts, {
								job: {
									actions: [
										{
											name: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
											params: { text: '=)' }
										},
										{
											name: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
											params: { text: '=(' }
										}
									]
								}
							})
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'withoutRes', done))
						},
						function withRes(done) {
							IODOpts.getResults = true
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'withRes', done))
						},
						function shouldHaveErrInRes(done) {
							IODOpts.job.actions.push({
								name: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
								params: { file: 'blah' }
							})
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'err', done))
						}
					], callback)
				})

				it('should be successful with jobId', function() {
					U.shouldBeSuccessful(this.params.withoutRes)
					U.shouldBeJobId(this.params.withoutRes)
				})

				it('should be successful with results', function() {
					U.shouldBeSuccessful(this.params.withRes)
					U.shouldHaveMultResults(this.params.withRes)
				})

				it('should contain IOD error', function() {
					U.shouldError(this.params.err)
					U.findErrorInRes(this.params.err.error).should.be.true
				})
			})

			describe('with files', function() {
				before(function(callback) {
					this.files = {}
					var env = this.files
					var IODOpts = {
						files: [{ name: 'file', path: 'invalid file path' }]
					}

					async.waterfall([
						apply(U.createIOD, i, env),

						function one(done) {
							_.defaults(IODOpts, {
								job: {
									actions: [
										{
											name: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
											params: { file: 'file' }
										},
										{
											name: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
											params: { file: 'file1' }
										}
									]
								}
							})
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'one', done))
						},
						function two(done) {
							IODOpts.files = [
								{
									name: 'file',
									path: __dirname + '/files/test1.txt'
								},
								{
									name: 'file1',
									path: __dirname + '/files/test2.txt'
								}
							]
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'two', done))
						},
						function three(done) {
							IODOpts.getResults = true
							env.IOD.job(IODOpts, U.beforeDoneFn(env, 'three', done))
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
					U.shouldHaveMultResults(this.files.three)
					_.size(this.files.three.response.actions[0].result.positive)
						.should.not.eql(0)
					_.size(this.files.three.response.actions[1].result.negative)
						.should.not.eql(0)
				})
			})
		})
	})
})