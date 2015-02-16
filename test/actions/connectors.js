/**
 * Test data for test connectors actions.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var ASTests = require('../action-schema-tests-utils')

var async = require('../../lib/async-ext')
var apply = async.apply

var should = require('should')
var T = require('../../lib/transform')

var createAction = 'createconnector'
var prependCreateAction = ASTests.withPrepend(createAction)
var statusAction = 'connectorstatus'
var prependStatusAction = ASTests.withPrepend(statusAction)
var deleteAction = 'deleteconnector'
var prependDeleteAction = ASTests.withPrepend(deleteAction)
var startAction = 'startconnector'
var prependStartAction = ASTests.withPrepend(startAction)
var updateAction = 'updateconnector'
var prependUpdateAction = ASTests.withPrepend(updateAction)
var retrieveAction = 'retrieveconfig'
var prependRetrieveAction = ASTests.withPrepend(retrieveAction)
var historyAction = 'connectorhistory'
var prependHistoryAction = ASTests.withPrepend(historyAction)

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
 *	{Function} it - Array of functions to execute that validates test,
 * }
 *
 * @param {IOD} IOD - IOD object
 * @returns {Array} - List of SchemaTests
 */
exports.schemaTests = function(IOD) {
	var defParams = {
		connector: 'connector',
		flavor: 'web_cloud',
		config: {},
		destination: {}
	}

	return [
		// Connectorstatus
		prependStatusAction.missingRequired(IOD, 'connector', 'CONSTATUS', statusAction),
		prependStatusAction.invalidStringType(IOD, 'connector', 'CONSTATUS', statusAction),

		// Createconnector
		prependCreateAction.missingRequired(IOD, 'connector', 'CREATECON', createAction),
		prependCreateAction.invalidStringType(IOD, 'connector', 'CREATECON', createAction),
		prependCreateAction.missingRequired(IOD, 'flavor', 'CREATECON', createAction),
		prependCreateAction.invalidStringType(IOD, 'flavor', 'CREATECON', createAction),
		prependCreateAction.missingRequired(IOD, 'config', 'CREATECON', createAction),
		prependCreateAction.invalidObjType(IOD, 'config', 'CREATECON', createAction),
		prependCreateAction.missingRequired(IOD, 'destination', 'CREATECON', createAction),
		prependCreateAction.invalidObjType(IOD, 'destination', 'CREATECON', createAction),
		prependCreateAction.invalidObjType(IOD, 'schedule', 'CREATECON', createAction),
		prependCreateAction.invalidStringType(IOD, 'description', 'CREATECON', createAction),

		// Basic createconnector flavor
		ASTests.withRequired(defParams).missingRequired(IOD, 'url', 'CREATECON', createAction),
		ASTests.withRequired(defParams).missingRequired(IOD, 'action', 'CREATECON', createAction),
		ASTests.withRequired(defParams).missingRequired(IOD, 'index', 'CREATECON', createAction),

		// Deleteconnector
		prependDeleteAction.missingRequired(IOD, 'connector', 'DELETECON', deleteAction),
		prependDeleteAction.invalidStringType(IOD, 'connector', 'DELETECON', deleteAction),

		// Retrieveconfig
		prependRetrieveAction.missingRequired(IOD, 'connector', 'RETRIEVECON', retrieveAction),
		prependRetrieveAction.invalidStringType(IOD, 'connector', 'RETRIEVECON', retrieveAction),

		// Startconnector
		prependStartAction.missingRequired(IOD, 'connector', 'STARTCON', startAction),
		prependStartAction.invalidStringType(IOD, 'connector', 'STARTCON', startAction),
		prependStartAction.invalidArrayObj(IOD, 'destination', 'STARTCON', startAction),

		// Updateconnector
		prependUpdateAction.missingRequired(IOD, 'connector', 'UPDATECON', updateAction),
		prependUpdateAction.invalidStringType(IOD, 'connector', 'UPDATECON', updateAction),
		prependUpdateAction.invalidObjType(IOD, 'config', 'UPDATECON', updateAction),
		prependUpdateAction.invalidObjType(IOD, 'destination', 'UPDATECON', updateAction),
		prependUpdateAction.invalidObjType(IOD, 'schedule', 'UPDATECON', updateAction),
		prependUpdateAction.invalidStringType(IOD, 'description', 'UPDATECON', updateAction),

		// Connectorhistory
		prependHistoryAction.invalidArrayString(IOD, 'connectors', 'CONHISTORY', historyAction),
		prependHistoryAction.invalidArrayString(IOD, 'tokens', 'CONHISTORY', historyAction),
		prependHistoryAction.invalidNumberType(IOD, 'start', 'CONHISTORY', historyAction),
		prependHistoryAction.invalidMinimum(IOD, 'start', 0, 'CONHISTORY', historyAction),
		prependHistoryAction.invalidNumberType(IOD, 'max_page_results', 'CONHISTORY', historyAction),
		prependHistoryAction.invalidMinimum(IOD, 'max_page_results', 0, 'CONHISTORY', historyAction),
		prependHistoryAction.invalidMiximum(IOD, 'max_page_results', 101, 'CONHISTORY', historyAction),
		prependHistoryAction.invalidNumberType(IOD, 'absolute_max_results', 'CONHISTORY', historyAction),
		prependHistoryAction.invalidMinimum(IOD, 'absolute_max_results', 0, 'CONHISTORY', historyAction),
		prependHistoryAction.invalidMiximum(IOD, 'absolute_max_results', 10001, 'CONHISTORY', historyAction),
		prependHistoryAction.invalidStringType(IOD, 'min_date', 'CONHISTORY', historyAction),
		prependHistoryAction.invalidStringType(IOD, 'max_date', 'CONHISTORY', historyAction),
		prependHistoryAction.invalidArrayString(IOD, 'statuses', 'CONHISTORY', historyAction),
		prependHistoryAction.invalidEnumValue(IOD, 'statuses', 'CONHISTORY', historyAction),
		prependHistoryAction.invalidBooleanType(IOD, 'show_latest_only', 'CONHISTORY', historyAction),

		// Flavors
		{
			name: 'web_cloud missing required parameter url',
			IODOpts: {
				action: T.attempt(U.paths.CREATECON, createAction)(IOD),
				params: {
					connector: 'connector',
					config: {},
					destination: {},
					flavor: 'web_cloud'
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'required', 'url')
			]
		},
		{
			name: 'filesystem_onsite missing required parameter directoryPathCSVs',
			IODOpts: {
				action: T.attempt(U.paths.CREATECON, createAction)(IOD),
				params: {
					connector: 'connector',
					config: {},
					destination: {},
					flavor: 'filesystem_onsite'
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'required', 'directoryPathCSVs')
			]
		}
	]
}

/**
 * Returns list of action tests.
 * Action tests consist of: {
 * 	{String} name - Name of test,
 * 	{Object} IODOpts - IOD options,
 *	{Function} it - Array of functions to execute that validates test,
 *	{Boolean} shouldError - True if test is expected to error,
 *	{Function} waitUntil - Function that accepts a `callback` and calls it when ready,
 *	{Boolean} noJobId - True to skip jobId test
 * }
 *
 * @param {IOD} IOD - IOD object
 * @param {Object} data - Prepared data for tests
 * @returns {Array} - List of ActionTests
 */
exports.tests = function(IOD, data) {
	var tests = [
		{
			name: 'create connector=testconnector',
			IODOpts: {
				action: T.attempt(U.paths.CREATECON, createAction)(IOD),
				params: {
					connector: U.testCon,
					flavor: 'web_cloud',
					config: {
						url: 'http://www.idolondemand.com',
						max_pages: 10
					},
					destination: {
						action: 'addtotextindex',
						index: U.testIndex
					},
					schedule: {
						frequency: {
							frequency_type: 'seconds',
							interval: 86400
						}
					},
					description: 'A description'
				}
			},
			it: U.defIt(createAction)
		},
		{
			name: 'retrieveconfig connector=testconnector',
			IODOpts: {
				action: T.attempt(U.paths.RETRIEVECON, retrieveAction)(IOD),
				params: { connector: U.testCon }
			},
			it: U.defIt(retrieveAction)
		},
		{
			name: 'update connector=testconnector,config,destination,schedule,description',
			IODOpts: {
				action: T.attempt(U.paths.UPDATECON, updateAction)(IOD),
				params: {
					connector: U.testCon,
					config: {
						url: 'http://www.idolondemand.com',
						max_pages: 10
					},
					destination: {
						action: 'addtotextindex',
						index: U.testIndex
					},
					schedule: {
						frequency: {
							frequency_type: 'seconds',
							interval: 86400
						}
					},
					description: 'description'
				}
			},
			it: U.defIt(updateAction)
		},
		{
			name: 'start connector=testconnector,destination',
			IODOpts: {
				action: T.attempt(U.paths.STARTCON, startAction)(IOD),
				params: {
					connector: U.testCon,
					destination: {
						action: 'addtotextindex',
						index: U.testIndex
					}
				}
			},
			waitUntil: U.waitUntilFinished(IOD),
			it: U.defIt(startAction)
		},
		{
			name: 'status connector=testconnector',
			IODOpts: {
				action: T.attempt(U.paths.CONSTATUS, statusAction)(IOD),
				params: { connector: U.testCon }
			},
			it: U.defIt(statusAction)
		},
		{
			name: 'history connector=testconnector',
			IODOpts: {
				action: T.attempt(U.paths.CONHISTORY, historyAction)(IOD),
				params: {
					connectors: U.testCon,
					start: 2,
					max_page_results: 2,
					absolute_max_results: 5,
					min_date: '-1',
					max_date: '1',
					statuses: 'finished',
					show_latest_only: true
				}
			},
			it: U.defIt(historyAction)
		},
		{
			name: 'delete connector=testconnector',
			IODOpts: {
				action: T.attempt(U.paths.DELETECON, deleteAction)(IOD),
				params: { connector: U.testCon }
			},
			it: U.defIt(deleteAction)
		}
	]

	// Skip jobId tests
	return _.map(tests, function(test) {
		test.noJobId = true
		return test
	})
}

/**
 * Preparation function.
 * 1.) Prepare a test index.
 * 2.) Prepares a clean connector test, deletes test connector if it doesn't already exists.
 *
 * @param {IOD} IOD - IOD object
 * @param {Function} done - Function(data)
 * @throws {Error} - If failed to delete existing test index
 */
exports.prepare = function(IOD, done) {
	async.series({
		clean: apply(U.prepare.cleanConnector, IOD),
		index: apply(U.prepare.testIndex, IOD)
	}, done)
}