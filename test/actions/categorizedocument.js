/**
 * Test data for categorizedocument action.
 */

'use strict';

var U = require('../utils')
var ASTests = require('../action-schema-tests-utils')

var _ = require('lodash')
var should = require('should')
var T = require('../../lib/transform')

var action = 'categorizedocument'
var filePath = __dirname + '/../files/' + action

/**
 * Specific type of action.
 */
exports.type = 'api'

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
		ASTests.noInputs(IOD, 'CATDOC', action),
		ASTests.invalidStringType(IOD, 'field_text', 'CATDOC', action),
		ASTests.invalidNumberType(IOD, 'max_results', 'CATDOC', action),
		ASTests.invalidStringType(IOD, 'indexes', 'CATDOC', action),
		ASTests.invalidStringType(IOD, 'database_match', 'CATDOC', action),
		ASTests.invalidEnumValue(IOD, 'print', 'CATDOC', action),
		ASTests.invalidStringType(IOD, 'print_fields', 'CATDOC', action)
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
	var defParams = {
		field_text: 'EXISTS{}:WIKIPEDIA_CATEGORY',
		max_results: 1,
		indexes: 'wiki_eng',
		print: 'none',
		print_fields: 'content'
	}

	return [
		{
			name: 'text=cats and dogs,ft,mr,i,pr,prf',
			IODOpts: {
				action: T.attempt(U.paths.CATDOC, action)(IOD),
				params: _.defaults({ text: 'cats and dogs' }, defParams)
			},
			it: U.defIt(action)
		},
		{
			name: 'url=idolondemand.com,ft,mr,i,pr,prf',
			IODOpts: {
				action: T.attempt(U.paths.CATDOC, action)(IOD),
				params: _.defaults({
					url: 'http://www.idolondemand.com'
				}, defParams)
			},
			it: U.defIt(action)
		},
		{
			name: 'reference=categorizedocument,ft,mr,i,pr,prf',
			IODOpts: {
				action: T.attempt(U.paths.CATDOC, action)(IOD),
				params: _.defaults({
					reference: T.attempt(T.get('ref'))(data)
				}, defParams)
			},
			it: U.defIt(action)
		},
		{
			name: 'file=cats and dogs,ft,mr,i,pr,prf',
			IODOpts: {
				action: T.attempt(U.paths.CATDOC, action)(IOD),
				params: defParams,
				files: [filePath]
			},
			it: U.defIt(action)
		},
		{
			name: 'json=cats and dogs,ft,mr,i,pr,prf',
			IODOpts: {
				action: T.attempt(U.paths.CATDOC, action)(IOD),
				params: _.defaults({
					json: {
						content: 'cats and dogs'
					}
				}, defParams)
			},
			it: U.defIt(action)
		},
		{
			name: 'file=invalid,ft,mr,i,pr,prf',
			IODOpts: {
				action: T.attempt(U.paths.CATDOC, action)(IOD),
				params: defParams,
				files: ['invalid file path']
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInError, 'ENOENT')
			],
			shouldError: true
		}
	]
}

/**
 * Preparation function. Prepares ActionTests with an object store reference.
 *
 * @param {IOD} IOD - IOD object
 * @param {Function} done - Function(data)
 * @throws {Error} - If error on storeobject action
 * @throws {Error} - If couldn't find reference in results
 */
exports.prepare = function(IOD, done) {
	// Can use same reference as findrelatedconcepts
	U.prepare.reference(IOD, 'findrelatedconcepts', filePath, function(err, ref) {
		done({ ref: ref })
	})
}