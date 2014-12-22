/**
 * Test data for user management actions.
 */

'use strict';

var U = require('../utils')
var ASTests = require('../action-schema-tests-utils')

var _ = require('lodash')
var should = require('should')
var T = require('../../lib/transform')

var addStoreAction = 'addstore'
var prependAddStoreAction = ASTests.withPrepend(addStoreAction)
var addUserAction = 'adduser'
var prependAddUserAction = ASTests.withPrepend(addUserAction)
var listStoreAction = 'liststores'
var listUserAction = 'listusers'
var prependListUsereAction = ASTests.withPrepend(listUserAction)
var delStoreAction = 'deletestore'
var prependDelStoreAction = ASTests.withPrepend(delStoreAction)
var delUserAction = 'deleteuser'
//var prependDelUserAction = ASTests.withPrepend(delUserAction)
var authAction = 'authenticate'
var prependAuthAction = ASTests.withPrepend(authAction)

/**
 * Specific type of action.
 */
exports.type = 'api'

/**
 * List of request-types to skip.
 */
exports.skipTypes = ['result', 'status', 'job']

/**
 * Returns list of schema tests for action.
 * Schema Tests consist of: {
 * 	{String} name - Name of test,
 * 	{Object} IODOpts - IOD options,
 *	{Function} it - Array of functions to execute that validates test
 * }
 *
 * @param {IOD} IOD - IOD object
 * @returns {Array} - List of SchemaTests
 */
exports.schemaTests = function(IOD) {
	return [
		// Addstore
		prependAddStoreAction.missingRequired(IOD, 'store', 'ADDSTORE', addStoreAction),
		prependAddStoreAction.invalidStringType(IOD, 'store', 'ADDSTORE', addStoreAction),

		// Adduser
		prependAddUserAction.missingRequired(IOD, 'store', 'ADDUSER', addUserAction),
		prependAddUserAction.invalidStringType(IOD, 'store', 'ADDUSER', addUserAction),
		prependAddUserAction.missingRequired(IOD, 'email', 'ADDUSER', addUserAction),
		prependAddUserAction.invalidStringType(IOD, 'email', 'ADDUSER', addUserAction),
		prependAddUserAction.missingRequired(IOD, 'password', 'ADDUSER', addUserAction),

		// Listuser
		prependListUsereAction.missingRequired(IOD, 'store', 'LISTUSER', listUserAction),
		prependListUsereAction.invalidStringType(IOD, 'store', 'LISTUSER', listUserAction),

		// Deletestore
		prependDelStoreAction.missingRequired(IOD, 'store', 'DELSTORE', delStoreAction),
		prependDelStoreAction.invalidStringType(IOD, 'store', 'DELSTORE', delStoreAction),

		// Deleteuser
		prependListUsereAction.missingRequired(IOD, 'store', 'DELUSER', delUserAction),
		prependListUsereAction.missingRequired(IOD, 'email', 'DELUSER', delUserAction),

		// Authenticate
		prependAuthAction.missingRequired(IOD, 'mechanism', 'AUTH', authAction),
		prependAuthAction.invalidStringType(IOD, 'mechanism', 'AUTH', authAction),
		prependAuthAction.missingRequired(IOD, 'store', 'AUTH', authAction),
		prependAuthAction.invalidStringType(IOD, 'store', 'AUTH', authAction),
		prependAuthAction.invalidStringType(IOD, 'user', 'AUTH', authAction),
		prependAuthAction.invalidStringType(IOD, 'password', 'AUTH', authAction)
	]
}

/**
 * Returns list of action tests.
 * Action tests consist of: {
 * 	{String} name - Name of test,
 * 	{Object} IODOpts - IOD options,
 *	{Function} it - Array of functions to execute that validates test,
 *	{Boolean} shouldError - True if test is expected to error,
  *	{Boolean} noJobId - True to skip jobId test
 * }
 *
 * @param {IOD} IOD - IOD object
 * @param {Object} data - Prepared data for tests
 * @returns {Array} - List of ActionTests
 */
exports.tests = function(IOD, data) {
	var tests = [
//		{
//			name: 'addstore store=teststore',
//			IODOpts: {
//				action: T.attempt(U.paths.ADDSTORE, addStoreAction)(IOD),
//				params: { store: U.testStore }
//			},
//			it: U.defIt(addStoreAction)
//		},
//		{
//			name: 'adduser store=teststore,email=test@test.com,password=test',
//			IODOpts: {
//				action: T.attempt(U.paths.ADDUSER, addUserAction)(IOD),
//				params: {
//					store: U.testStore,
//					email: U.testUser,
//					password: U.testPass
//				}
//			},
//			it: U.defIt(addUserAction)
//		},
		{
			name: 'authenticate mech=simple,store=teststore,user=test,pass=test',
			IODOpts: {
				action: T.attempt(U.paths.AUTH, authAction)(IOD),
				params: {
					mechanism: 'simple',
					store: U.testStore,
					user: U.testUser,
					password: U.testPass
				}
			},
			it: U.defIt(authAction)
		},
		{
			name: 'liststore',
			IODOpts: {
				action: T.attempt(U.paths.LISTSTORE, listStoreAction)(IOD),
				params: {}
			},
			it: U.defIt(listStoreAction)
		},
		{
			name: 'listuser store=teststore',
			IODOpts: {
				action: T.attempt(U.paths.LISTUSER, listUserAction)(IOD),
				params: { store: U.testStore }
			},
			it: U.defIt(listUserAction)
		},
//		{
//			name: 'deleteuser store=teststore,email=test@test.com',
//			IODOpts: {
//				action: T.attempt(U.paths.DELUSER, delUserAction)(IOD),
//				params: {
//					store: U.testStore,
//					email: U.testUser
//				}
//			},
//			it: U.defIt(delUserAction)
//		},
//		{
//			name: 'deletestore store=teststore',
//			IODOpts: {
//				action: T.attempt(U.paths.DELSTORE, delStoreAction)(IOD),
//				params: { store: U.testStore }
//			},
//			it: U.defIt(delStoreAction)
//		}
	]

	// Skip jobId tests
	return _.map(tests, function(test) {
		test.noJobId = true
		return test
	})
}

/**
 * Preparation function.
 * 1.) Prepares clean test store if it isn't already deleted.
 *
 * @param {IOD} IOD - IOD object
 * @param {Function} callback - Function(data)
 * @throws {Error} - If failed to delete existing test index
 */
// TODO: right now requires that test store and user already exists
exports.prepare = function(IOD, callback) {
//	U.prepare.cleanStore(IOD, callback)
	callback()
}