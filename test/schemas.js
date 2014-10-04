/**
 * Unit test for action schema checks.
 */

'use strict';

var _ = require('lodash')
var U = require('./utils')
var should = require('should')

var async = require('../lib/async-ext')
var apply = async.apply

describe('#ACTIONS.SCHEMAS', function() {
	U.timeout(this)

	before(function(callback) {
		this.schemas = {}
		var env = this.schemas
		var IODOpts = {}

		async.waterfall([
			apply(U.createIOD, 0, env),

			function syncEmptyObject(done) {
				_.defaults(IODOpts, { action: env.IOD.ACTIONS.API.ANALYZESENTIMENT })

				env.IOD.sync(IODOpts, U.beforeDoneFn(env, 'syncEmpty', done))
			},

			function asyncEmptyObject(done) {
				env.IOD.async(IODOpts, U.beforeDoneFn(env, 'asyncEmpty', done))
			},

			function jobEmptyParams(done) {
				var job = {
					actions: [
						{
							name: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
							params: { text: '=)' }
						},
						{
							name: env.IOD.ACTIONS.API.ANALYZESENTIMENT
						}
					]
				}

				env.IOD.job({ job: job }, U.beforeDoneFn(env, 'jobEmpty', done))
			},

			function jobInvalidLang(done) {
				var job = {
					actions: [
						{
							name: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
							params: { text: '=)' }
						},
						{
							name: env.IOD.ACTIONS.API.ANALYZESENTIMENT,
							params: {
								text: '=)',
								language: 'invalid language'
							}
						}
					]
				}

				env.IOD.job({ job: job }, U.beforeDoneFn(env, 'jobLang', done))
			},

			function syncInvalidLang(done) {
				_.defaults(IODOpts, { params: {
					text: '=)',
					language: 'invalid language'
				} })

				env.IOD.sync(IODOpts, U.beforeDoneFn(env, 'syncLang', done))
			},

			function asyncInvalidLang(done) {
				env.IOD.async(IODOpts, U.beforeDoneFn(env, 'asyncLang', done))
			}
		], callback)
	})

	it('sync action should fail with missing required inputs', function() {
		U.shouldError(this.schemas.syncEmpty)
		U.shouldContain(this.schemas.syncEmpty.error, 'inputs')
	})

	it('async action should fail with missing required inputs', function() {
		U.shouldError(this.schemas.asyncEmpty)
		U.shouldContain(this.schemas.asyncEmpty.error, 'inputs')
	})

	it('sync should fail with invalid parameter', function() {
		U.shouldError(this.schemas.syncLang)
		U.findSchemaMsgError(this.schemas.syncLang.error, 'enum', 'language')
	})

	it('async action should fail with invalid parameter', function() {
		U.shouldError(this.schemas.asyncLang)
		U.findSchemaMsgError(this.schemas.asyncLang.error, 'enum', 'language')
	})

	it('job action should fail with missing required inputs', function() {
		U.shouldError(this.schemas.jobEmpty)
		U.shouldContain(this.schemas.jobEmpty.error[0].error, 'inputs')
	})

	it('job action should fail with invalid parameter', function() {
		U.shouldError(this.schemas.jobLang)
		U.findSchemaMsgError(this.schemas.jobLang.error[0].error, 'enum', 'language')
	})
})