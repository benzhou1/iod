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
var prependAddStoreAction = ASTests.withPrepend(addStoreAction)
var addUserAction = 'adduser'
var prependAddUserAction = ASTests.withPrepend(addUserAction)
var addRoleAction = 'addrole'
var prependAddRoleAction = ASTests.withPrepend(addRoleAction)

var listStoreAction = 'liststores'
var listUserAction = 'listusers'
var prependListUserAction = ASTests.withPrepend(listUserAction)
var listRolesAction = 'listroles'
var prependListRolesAction = ASTests.withPrepend(listRolesAction)

var delStoreAction = 'deletestore'
var prependDelStoreAction = ASTests.withPrepend(delStoreAction)
var delUserAction = 'deleteuser'
var prependDelUserAction = ASTests.withPrepend(delUserAction)
var delRoleAction = 'deleterole'
var prependDelRoleAction = ASTests.withPrepend(delRoleAction)

var authAction = 'authenticate'
var prependAuthAction = ASTests.withPrepend(authAction)

var assignAction = 'assignrole'
var prependAssignAction = ASTests.withPrepend(assignAction)
var unassignAction = 'unassignrole'
var prependUnassignAction = ASTests.withPrepend(unassignAction)


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

		// Addrole
		prependAddRoleAction.missingRequired(IOD, 'store', 'ADDROLE', addRoleAction),
		prependAddRoleAction.invalidStringType(IOD, 'store', 'ADDROLE', addRoleAction),
		prependAddRoleAction.missingRequired(IOD, 'role', 'ADDROLE', addRoleAction),
		prependAddRoleAction.invalidStringType(IOD, 'role', 'ADDROLE', addRoleAction),

		// Listuser
		prependListUserAction.missingRequired(IOD, 'store', 'LISTUSER', listUserAction),
		prependListUserAction.invalidStringType(IOD, 'store', 'LISTUSER', listUserAction),

		// Listroles
		prependListRolesAction.missingRequired(IOD, 'store', 'LISTROLES', listRolesAction),
		prependListRolesAction.invalidStringType(IOD, 'store', 'LISTROLES', listRolesAction),

		// Deletestore
		prependDelStoreAction.missingRequired(IOD, 'store', 'DELSTORE', delStoreAction),
		prependDelStoreAction.invalidStringType(IOD, 'store', 'DELSTORE', delStoreAction),

		// Deleteuser
		prependDelUserAction.missingRequired(IOD, 'store', 'DELUSER', delUserAction),
		prependDelUserAction.missingRequired(IOD, 'email', 'DELUSER', delUserAction),

		// Deleterole
		prependDelRoleAction.missingRequired(IOD, 'store', 'DELROLE', delRoleAction),
		prependDelRoleAction.missingRequired(IOD, 'role', 'DELROLE', delRoleAction),

		// Authenticate
		prependAuthAction.missingRequired(IOD, 'mechanism', 'AUTH', authAction),
		prependAuthAction.invalidStringType(IOD, 'mechanism', 'AUTH', authAction),
		prependAuthAction.missingRequired(IOD, 'store', 'AUTH', authAction),
		prependAuthAction.invalidStringType(IOD, 'store', 'AUTH', authAction),
		prependAuthAction.invalidStringType(IOD, 'user', 'AUTH', authAction),
		prependAuthAction.invalidStringType(IOD, 'password', 'AUTH', authAction),

		// Assignrole
		prependAssignAction.missingRequired(IOD, 'store', 'ASSIGNROLE', assignAction),
		prependAssignAction.invalidStringType(IOD, 'store', 'ASSIGNROLE', assignAction),
		prependAssignAction.missingRequired(IOD, 'user', 'ASSIGNROLE', assignAction),
		prependAssignAction.invalidStringType(IOD, 'user', 'ASSIGNROLE', assignAction),
		prependAssignAction.missingRequired(IOD, 'role', 'ASSIGNROLE', assignAction),
		prependAssignAction.invalidStringType(IOD, 'role', 'ASSIGNROLE', assignAction),

		// Unassignrole
		prependUnassignAction.missingRequired(IOD, 'store', 'UNASSIGNROLE', unassignAction),
		prependUnassignAction.invalidStringType(IOD, 'store', 'UNASSIGNROLE', unassignAction),
		prependUnassignAction.missingRequired(IOD, 'user', 'UNASSIGNROLE', unassignAction),
		prependUnassignAction.invalidStringType(IOD, 'user', 'UNASSIGNROLE', unassignAction),
		prependUnassignAction.missingRequired(IOD, 'role', 'UNASSIGNROLE', unassignAction),
		prependUnassignAction.invalidStringType(IOD, 'role', 'UNASSIGNROLE', unassignAction)
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
//		{
//			name: 'addrole store=teststore,@test.com,role=testrole',
//			IODOpts: {
//				action: T.attempt(U.paths.ADDROLE, addRoleAction)(IOD),
//				params: {
//					store: U.testStore,
//					role: U.testRole
//				}
//			},
//			it: U.defIt(addRoleAction)
//		},
		{
			name: 'assignrole store=teststore,user=test@test.com,role=testrole',
			IODOpts: {
				action: T.attempt(U.paths.ASSIGNROLE, assignAction)(IOD),
				params: {
					store: U.testStore,
					user: U.testUser,
					role: U.testRole
				}
			},
			it: U.defIt(assignAction)
		},
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
		{
			name: 'listroles store=teststore',
			IODOpts: {
				action: T.attempt(U.paths.LISTROLES, listRolesAction)(IOD),
				params: { store: U.testStore }
			},
			it: U.defIt(listRolesAction)
		},
		{
			name: 'unassignrole store=teststore,user=test@test.com,role=testrole',
			IODOpts: {
				action: T.attempt(U.paths.UNASSIGNROLE, unassignAction)(IOD),
				params: {
					store: U.testStore,
					user: U.testUser,
					role: U.testRole
				}
			},
			it: U.defIt(unassignAction)
		},
		// TODO: wait for fix on deletes
//		{
//			name: 'deletrole store=teststore,email=test@test.com',
//			IODOpts: {
//				action: T.attempt(U.paths.DELROLE, delRoleAction)(IOD),
//				params: {
//					store: U.testStore,
//					role: U.testRole
//				}
//			},
//			it: U.defIt(delRoleAction)
//		},
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
 * @param {Function} done - Function(data)
 * @throws {Error} - If failed to delete existing test index
 */
// TODO: right now requires that test store and user already exists
exports.prepare = function(IOD, done) {
//	U.prepare.cleanStore(IOD, done)
	done()
}