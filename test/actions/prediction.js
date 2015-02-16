/**
 * Test data for test prediction actions.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var ASTests = require('../action-schema-tests-utils')

var async = require('../../lib/async-ext')
var apply = async.apply

var should = require('should')
var T = require('../../lib/transform')

var trainAction = 'trainpredictor'
var prependCreateAction = ASTests.withPrepend(trainAction)
var predictAction = 'predict'
var prependStatusAction = ASTests.withPrepend(predictAction)

var filePath = __dirname + '/../files/' + predictAction


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
	return [
		// Trainpredictor
		prependStatusAction.missingRequired(IOD, 'service_name', 'TRAINPRED', trainAction),
		prependStatusAction.missingRequired(IOD, 'prediction_field', 'TRAINPRED', trainAction),
		prependStatusAction.invalidStringType(IOD, 'empty_value', 'TRAINPRED', trainAction),

		// Predict
		prependCreateAction.missingRequired(IOD, 'service_name', 'PREDICT', predictAction),
		prependStatusAction.invalidStringType(IOD, 'format', 'PREDICT', predictAction),
		prependCreateAction.invalidEnumValue(IOD, 'format', 'PREDICT', predictAction)
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
		// TODO: wait for a delete, for now testpredictor needs to exist
//		{
//			name: 'train service_name=testpredictor',
//			IODOpts: {
//				action: T.attempt(U.paths.TRAINPRED, trainAction)(IOD),
//				params: {
//					service_name: U.testServiceName,
//					prediction_field: 'class',
//					empty_value: '-1'
//				}
//			},
//			it: U.defIt(trainAction)
//		},
		{
			name: 'predict service_name=testpredictor,json',
			IODOpts: {
				action: T.attempt(U.paths.PREDICT, predictAction)(IOD),
				params: {
					service_name: U.testServiceName,
					format: 'json',
					json: {
						fields: [{ name: 'iris', order: 0, type: 'SMALL_TEXT' }],
						values: [{ row: ['Iris-blahblah'] }]
					}
				}
			},
			it: U.defIt(predictAction)
		},
		// TODO: fix on file
//		{
//			name: 'predict service_name=testpredictor,file',
//			IODOpts: {
//				action: T.attempt(U.paths.PREDICT, predictAction)(IOD),
//				params: {
//					service_name: U.testServiceName,
//					format: 'json'
//				},
//				files: [filePath]
//			},
//			it: U.defIt(predictAction)
//		},
//		{
//			name: 'predict service_name=testpredictor,reference',
//			IODOpts: {
//				action: T.attempt(U.paths.PREDICT, predictAction)(IOD),
//				params: {
//					service_name: U.testServiceName,
//					format: 'json',
//					reference: T.attempt(T.get('ref'))(data)
//				}
//			},
//			it: U.defIt(predictAction)
//		},
		{
			name: 'predict service_name=testpredictor,url',
			IODOpts: {
				action: T.attempt(U.paths.PREDICT, predictAction)(IOD),
				params: {
					service_name: U.testServiceName,
					format: 'json',
					url: 'https://www.idolondemand.com/sample-content/prediction/iris.json'
				}
			},
			it: U.defIt(predictAction)
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
 *
 * @param {IOD} IOD - IOD object
 * @param {Function} done - Function(data)
 * @throws {Error} - If failed to delete existing test index
 */
exports.prepare = function(IOD, done) {
//	U.prepare.reference(IOD, predictAction, filePath, function(err, ref) {
//		done({ ref: ref })
//	})
	done()
}