/**
 * Main test file that runs all request type test against each action test.
 * IncludeReq is a list of request-type test to include in the run.
 * ExcludeReq is a list of request-type test to exclude in the run.
 * IncludeAct is a list of action test to include in the run.
 * ExcludeAct is a list of action test to exclude in the run.
 * actionSchemaOnly is a boolean that says to either run only the ActionSchemaTests.
 *
 * Every request-type has RequestSchemaTests and RequestTests.
 * Every action has ActionSchemaTests and ActionTests.
 *
 * Terminology:
 * 	request-type - refers to each filename listed under /test/request-types
 * 	action - refers to each filename listed under /test/actions
 * 	RequestSchemaTests - test for validating request-type schema
 * 	RequestTests - test for validating request-type endpoints
 *  ActionSchemaTests - test for validating action schema
 *  ActionTests - test with specific action for running with RequestTests
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

// Include request-type tests
var includeReq = ['async']
// Exclude request-type tests
var excludeReq = []
// Include action tests
var includeAct = ['createdeletetextindex']
// Exclude action tests
// Quota for expandcontainer is 500, don't run unless we really have to
// Quota for recognizeimages is 1000, don't run unless we really have to
var excludeAct = ['expandcontainer', 'recognizeimages']
// Set to true to run only ActionSchemaTests
var actionSchemaOnly = false

if (!_.isEmpty(includeReq)) ReqTests = _.pick(ReqTests, includeReq)
if (!_.isEmpty(excludeReq)) ReqTests = _.omit(ReqTests, excludeReq)
if (!_.isEmpty(includeAct)) Actions = _.pick(Actions, includeAct)
if (!_.isEmpty(excludeAct)) Actions = _.omit(Actions, excludeAct)

// Runs RequestSchemaTest and RequestTest for every request-type
_.each(ReqTests, function(ReqTest, reqType) {
	describe('#' + reqType.toUpperCase(), function() {
		U.timeout(this)

		// Runs RequestSchemaTest for current request-type
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

		/**
		 * Runs every ActionSchemaTest and ActionTest for every action, against
		 * current request-type.
		 */
		_.each(Actions, function(ActionTest, action) {
			/**
			 * If current action type does not match the supported type of current
			 * request-type then move on to next action.
			 */
			if (ActionTest.type !== ReqTest.type) return

			describe('#' + action.toUpperCase(), function() {
				/**
				 * If current request-type does not support ActionSchemaTest,
				 * don't run ActionSchemaTest.
				 */
				if (!ReqTest.noActionSchema) {
					// Run ActionSchemaTest for current action
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
											/**
											 * Need to transform ActionSchemaTest IODOpts
											 * for jobs to handle.
											 */
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

				// If set don't run ActionTests
				if (!actionSchemaOnly) {
					// Runs every RequestTest for current request-type
					_.each(ReqTest.tests, function(reqTest) {
						// Runs with IOD created via the create method
						describe('[CREATE IOD]' + reqTest.name, function() {
							before(function(callback) {
								this[action] = this[action] || {}
								this[action][reqTest.name] = {}
								var env = this[action][reqTest.name]

								U.createIOD(function(err, IOD) {
									if (err) return callback()
									beforeActionTest(IOD, reqTest, ActionTest, env, callback)
								})
							})

							itActionTest(ActionTest, reqTest, action)
						})

						// Runs with IOD created via a new instance
						describe('[NEW IOD]' + reqTest.name, function() {
							before(function(callback) {
								this[action] = this[action] || {}
								this[action][reqTest.name] = {}
								var env = this[action][reqTest.name]

								beforeActionTest(U.IOD, reqTest, ActionTest, env, callback)
							})

							itActionTest(ActionTest, reqTest, action)
						})
					})
				}
			})
		})
	})
})

/**
 * Runs every ActionTests for current action.
 *
 * @param {IOD} IOD - IOD object
 * @param {object} reqTest - RequestTest
 * @param {object} ActionTest - ActionTest
 * @param {object} env - Environment object
 * @param {function} callback - Callback()
 */
function beforeActionTest(IOD, reqTest, ActionTest, env, callback) {
	// Makes preparations before running all ActionTest
	ActionTest.prepare(IOD, function(data) {
		var beforeFns = []

		// Collect every ActionTest to run with current RequestTest
		_.each(ActionTest.tests(IOD, data), function(actionTest) {
			beforeFns = beforeFns.concat(function(done) {
				/**
				 * If current RequestTest does not support the current
				 * ActionTest then skip.
				 */
				if (reqTest.skip && reqTest.skip(actionTest)) {
					return done()
				}
				reqTest.beforeFn(IOD, actionTest,
					U.beforeDoneFn(env, actionTest.name, done))
			})
		})

		async.waterfall(beforeFns, callback)
	})
}

/**
 * Runs every ActionTests validation it checks.
 *
 * @param {object} ActionTest - ActionTest
 * @param {object} reqTest - RequestTest
 * @param {string} action - Current action
 */
function itActionTest(ActionTest, reqTest, action) {
	_.each(ActionTest.tests(U.IOD), function(actionTest) {
		if (reqTest.skip && reqTest.skip(actionTest)) return
		it(actionTest.name, function() {
			T.seq(reqTest.itFn(actionTest))(this[action][reqTest.name][actionTest.name])
		})
	})
}

/**
 * Transform IODOpts into IODOpts of job request.
 *
 * @param {object} IODOpts - IOD options
 * @returns {object} Transformed IODOpts
 */
function transformIODOptsForJob(IODOpts) {
	IODOpts.job = {
		actions: [U.createJobAction(IODOpts, 1)]
	}
	IODOpts.files = _.map(IODOpts.files, function(filePath, i) {
		return {
			name: 'file' + (i+1),
			path: filePath
		}
	})

	return IODOpts
}