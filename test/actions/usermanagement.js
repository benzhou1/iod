/**
 * Test data for user management actions.
 */

'use strict';

var U = require('../utils')
var ASTests = require('../action-schema-tests-utils')

var _ = require('lodash')
var should = require('should')
var T = require('../../lib/transform')

var async = require('../../lib/async-ext')
var apply = async.apply

var addStoreAction = 'addstore'
var addUserAction = 'adduser'
var listStoreAction = 'liststores'
var listUserAction = 'listusers'
var delStoreAction = 'deletestore'
var delUserAction = 'deleteuser'
var authAction = 'authenticate'

/**
 * Specific type of action.
 */
exports.type = 'api'

/**
 * List of request-types to skip.
 */
exports.skipTypes = ['result', 'status']

/**
 * Returns list of schema tests for action.
 * Schema Tests consist of: {
 * 	{String} name - Name of test,
 * 	{Object} IODOpts - IOD options,
 *	{Function} it - Array of functions to execute that validates test,
 * }
 *
 * @param {IOD} IOD - IOD object
 * @returns {Array} - List of SchemaTests
 */
exports.schemaTests = function(IOD) {
	return [
		// Addstore
		ASTests.missingRequired(IOD, 'store', 'ADDSTORE', addStoreAction),

		// Adduser
		ASTests.missingRequired(IOD, 'store', 'ADDUSER', addUserAction),
		ASTests.missingRequired(IOD, 'email', 'ADDUSER', addUserAction),
		ASTests.missingRequired(IOD, 'password', 'ADDUSER', addUserAction),

		// Listuser
		ASTests.missingRequired(IOD, 'store', 'LISTSTORE', listStoreAction),

		// Deletestore
		ASTests.missingRequired(IOD, 'store', 'DELSTORE', delStoreAction),

		// Deleteuser
		ASTests.missingRequired(IOD, 'store', 'DELUSER', delUserAction),
		ASTests.missingRequired(IOD, 'email', 'DELUSER', delUserAction),

		// Authenticate
		ASTests.missingRequired(IOD, 'mechanism', 'AUTH', authAction),
		ASTests.missingRequired(IOD, 'store', 'AUTH', authAction),
		ASTests.invalidStringType(IOD, 'user', 'AUTH', authAction),
		ASTests.invalidStringType(IOD, 'password', 'AUTH', authAction)
	]
}

/**
 * Returns list of action tests.
 * Action tests consist of: {
 * 	{String} name - Name of test,
 * 	{Object} IODOpts - IOD options,
 *	{Function} it - Array of functions to execute that validates test,
 *	{Boolean} shouldError - True if test is expected to error
 * }
 *
 * @param {IOD} IOD - IOD object
 * @param {Object} data - Prepared data for tests
 * @returns {Array} - List of ActionTests
 */
exports.tests = function(IOD, data) {
	return [
//		{
//			name: 'addstore store=teststore',
//			IODOpts: {
//				action: T.attempt(U.paths.ADDSTORE, addStoreAction)(IOD),
//				params: { store: 'teststore' }
//			},
//			it: U.defIt(addStoreAction)
//		},
//		{
//			name: 'adduser store=teststore,email=test@test.com,password=test',
//			IODOpts: {
//				action: T.attempt(U.paths.ADDUSER, addUserAction)(IOD),
//				params: {
//					store: 'teststore',
//					email: 'test@test.com',
//					password: 'test'
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
					store: 'teststore',
					user: 'test@test.com',
					password: 'test'
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
				params: { store: 'teststore' }
			},
			it: U.defIt(listUserAction)
		},
//		{
//			name: 'deleteuser store=teststore,email=test@test.com',
//			IODOpts: {
//				action: T.attempt(U.paths.DELUSER, delUserAction)(IOD),
//				params: {
//					store: 'teststore',
//					email: 'test@test.com'
//				}
//			},
//			it: U.defIt(delUserAction)
//		},
//		{
//			name: 'deletestore store=teststore',
//			IODOpts: {
//				action: T.attempt(U.paths.DELSTORE, delStoreAction)(IOD),
//				params: { store: 'teststore' }
//			},
//			it: U.defIt(delStoreAction)
//		}
	]
}

/**
 * Preparation function.
 * 1.) Prepares clean test store if it isn't already deleted.
 *
 * @param {IOD} IOD - IOD object
 * @param {Function} callback - Function(data)
 * @throws {Error} - If failed to delete existing test index
 */
// TODO: wait for fix in production
exports.prepare = function(IOD, callback) {
//	U.prepare.cleanStore(IOD, callback)
	callback()
}