/**
 * Main test file that runs all request type test against each action test.
 */

'use strict';

var _ = require('lodash')
var U = require('./utils')
var should = require('should')
var T = require('../lib/transform')
var async = require('../lib/async-ext')
var requireDir = require('require-dir')

var Actions = requireDir(__dirname + '/actions')
var ReqTests = requireDir(__dirname + '/request-types')

_.each(ReqTests, function(ReqTest, reqType) {
	describe('#' + reqType.toUpperCase(), function() {
		U.timeout(this)

		describe('#Schema Validation', function() {
			before(function(callback) {
				this.schema = {}
				var env = this.schema

				U.createIOD(function(err, IOD) {
					if (err) return callback()

					var beforeFns = _.map(ReqTest.schemaTests(IOD), function(SchemaTest) {
						return function(done) {
							IOD[reqType](SchemaTest.IODOpts,
								U.beforeDoneFn(env, SchemaTest.name, done))
						}
					})

					async.waterfall(beforeFns, callback)
				})
			})

			_.each(ReqTest.schemaTests(), function(SchemaTest) {
				it('[REQSCHEMA] - ' + SchemaTest.name, function() {
					T.seq(SchemaTest.it)(this.schema[SchemaTest.name])
				})
			})
		})

		_.each(Actions, function(ActionTest, action) {
			describe('#' + action.toUpperCase(), function() {
				if (!ReqTest.noActionSchema) {
					describe('#Schema Validation', function() {
						before(function(callback) {
							this[action] = this[action] || {}
							this[action].actSchema = {}
							var env = this[action].actSchema

							U.createIOD(function(err, IOD) {
								if (err) return callback()

								var beforeFns = _.map(ActionTest.schemaTests(IOD),
									function(ActSchemaTest) {
										return function(done) {
											var IODOpts = reqType === IOD.TYPES.JOB ?
												transformIODOptsForJob(ActSchemaTest.IODOpts) :
												ActSchemaTest.IODOpts

											IOD[reqType](IODOpts,
												U.beforeDoneFn(env, ActSchemaTest.name, done))
										}
									}
								)

								async.waterfall(beforeFns, callback)
							})
						})

						_.each(ActionTest.schemaTests(), function(ActSchemaTest) {
							it('[ACTIONSCHEMA] - ' + ActSchemaTest.name, function() {
								T.seq(ActSchemaTest.it)(this[action].actSchema[ActSchemaTest.name])
							})
						})
					})
				}

				_.each(ReqTest.tests, function(reqTest) {
					describe('[CREATE IOD]' + reqTest.name, function() {
						before(function(callback) {
							this[action] = this[action] || {}
							this[action][reqTest.name] = {}
							var env = this[action][reqTest.name]

							U.createIOD(function(err, IOD) {
								if (err) return callback()

								ActionTest.prepare(IOD, function(data) {
									var beforeFns = []
									_.each(ActionTest.tests(IOD, data), function(actionTest) {
										beforeFns = beforeFns.concat(function(done) {
											if (reqTest.skip && reqTest.skip(actionTest)) {
												return done()
											}
											reqTest.beforeFn(IOD, actionTest,
												U.beforeDoneFn(env, actionTest.name, done))
										})
									})

									async.waterfall(beforeFns, callback)
								})
							})
						})

						_.each(ActionTest.tests(), function(actionTest) {
							if (reqTest.skip && reqTest.skip(actionTest)) return
							it(actionTest.name, function() {
								T.seq(reqTest.itFn(actionTest))
									(this[action][reqTest.name][actionTest.name])
							})
						})
					})
				})
			})
		})
	})
})

function transformIODOptsForJob(IODOpts) {
	var action = { name: IODOpts.action }
	if (IODOpts.params) action.params =  IODOpts.params

	return {
		job: {
			actions: [action]
		}
	}
}