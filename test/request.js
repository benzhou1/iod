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

var config = require('./config_defaults')

try {
	// To override default config, create a config.js file
	var overrideCfg = require('./config')
	config = _.defaults({}, overrideCfg, config)
}
// No config.js file found
catch(e) {}

// Extract configuration parameters for config
var includeReq = config.includeReq
var excludeReq = config.excludeReq
var includeAct = config.includeAct
var excludeAct = config.excludeAct
var actionSchemaOnly = config.actionSchemaOnly
var simpleTest = config.simpleTest

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
			/**
			 * If request-type is in ActionTest skip list then move one to next action.
			 */
			if (ActionTest.skipTypes && _.contains(ActionTest.skipTypes, reqType)) return
			/**
			 * If simpleTest is set to true, skip `result` RequestTests
			 */
			if (simpleTest && reqType === 'result') return

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
					_.each(ReqTest.tests, function(reqTest, i) {
						/**
						 * If simpletest is set to true, only run first ReqTest
						 */
						if (simpleTest && i > 0) return

						// Runs with IOD created via the create method
						describe('[CREATE IOD]' + reqTest.name, function() {
							before(function(callback) {
								this[action] = this[action] || {}
								this[action][reqTest.name] = {}
								var env = this[action][reqTest.name]

								U.createIOD(function(err, IOD) {
									beforeActionTest(IOD, reqTest, ActionTest, env, callback)
								})
							})

							itActionTest(ActionTest, reqTest, action)
						})

						// If simpleTest is set to true skip, IOD via new tests
						if (!simpleTest) {
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
						}
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
 * @param {Object} reqTest - RequestTest
 * @param {Object} ActionTest - ActionTest
 * @param {Object} env - Environment object
 * @param {Function} callback - Callback()
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
				if (reqTest.skip && reqTest.skip(actionTest)) return done()

				reqTest.beforeFn(IOD, actionTest, function(err, res) {
					if (err) return U.beforeDoneFn(env, actionTest.name, done)(err, res)

					/**
					 * Wait for a specified number of seconds before moving on to the
					 * next ActionTest.
					 */
					if (actionTest.wait) {
						console.log('[WAIT] - Waiting ' + actionTest.wait + ' seconds...')
						var wait = function(secs) {
							if (secs > 0) {
								console.log('[WAIT] - ' + secs + ' seconds left...')
								setTimeout(wait, 10000, secs - 10)
							}
							else {
								console.log('[WAIT} - Done waiting...')
								U.beforeDoneFn(env, actionTest.name, done)(err, res)
							}
						}

						setTimeout(wait, 10000, actionTest.wait-10)
					}
					/**
					 * Wait until `waitUntil` callback function is called before moving
					 * on to next test.
					 */
					else if (actionTest.waitUntil) {
						actionTest.waitUntil(function() {
							U.beforeDoneFn(env, actionTest.name, done)(err, res)
						})
					}
					else U.beforeDoneFn(env, actionTest.name, done)(err, res)
				})
			})
		})

		async.waterfall(beforeFns, callback)
	})
}

/**
 * Runs every ActionTests validation it checks.
 *
 * @param {Object} ActionTest - ActionTest
 * @param {Object} reqTest - RequestTest
 * @param {String} action - Current action
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
 * @param {Object} IODOpts - IOD options
 * @returns {Object} Transformed IODOpts
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