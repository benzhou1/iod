/**
 * Test data for findsimilar action.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var T = require('../../lib/transform')

var action = 'findsimilar'
var filePath = __dirname + '/../files/' + action

/**
 * Specific type of action.
 */
exports.type = 'api'

/**
 * Returns list of schema tests for action.
 * Schema Tests consist of: {
 * 	{string} name - Name of test,
 * 	{object} IODOpts - IOD options,
 *	{function} it - Array of functions to execute that validates test,
 * }
 *
 * @param {IOD} IOD - IOD object
 * @returns {Array} - List of SchemaTests
 */
exports.schemaTests = function(IOD) {
	return [
		U.actSchemaTests.noInputs(IOD, 'FINDSIM', action),
		U.actSchemaTests.invalidStringType(IOD, 'field_text', 'FINDSIM', action),
		U.actSchemaTests.invalidNumberType(IOD, 'start', 'FINDSIM', action),
		U.actSchemaTests.invalidMinimum(IOD, 'start', 0, 'FINDSIM', action),
		U.actSchemaTests.invalidNumberType(IOD, 'max_page_results', 'FINDSIM', action),
		U.actSchemaTests.invalidMinimum(IOD, 'max_page_results', 0, 'FINDSIM', action),
		U.actSchemaTests.invalidNumberType(IOD, 'absolute_max_results', 'FINDSIM', action),
		U.actSchemaTests.invalidMinimum(IOD, 'absolute_max_results', 0, 'FINDSIM', action),
		U.actSchemaTests.invalidStringType(IOD, 'indexes', 'FINDSIM', action),
		U.actSchemaTests.invalidStringType(IOD, 'database_match', 'FINDSIM', action),
		U.actSchemaTests.invalidEnumValue(IOD, 'print', 'FINDSIM', action),
		U.actSchemaTests.invalidStringType(IOD, 'print_fields', 'FINDSIM', action),
		U.actSchemaTests.invalidEnumValue(IOD, 'highlight', 'FINDSIM', action),
		U.actSchemaTests.invalidStringType(IOD, 'min_date', 'FINDSIM', action),
		U.actSchemaTests.invalidStringType(IOD, 'max_date', 'FINDSIM', action),
		U.actSchemaTests.invalidNumberType(IOD, 'min_score', 'FINDSIM', action),
		U.actSchemaTests.invalidEnumValue(IOD, 'sort', 'FINDSIM', action),
		U.actSchemaTests.invalidBooleanType(IOD, 'total_results', 'FINDSIM', action),
		U.actSchemaTests.invalidStringType(IOD, 'start_tag', 'FINDSIM', action),
		U.actSchemaTests.invalidStringType(IOD, 'end_tag', 'FINDSIM', action),
		U.actSchemaTests.invalidEnumValue(IOD, 'summary', 'FINDSIM', action)
	]
}

/**
 * Returns list of action tests.
 * Action tests consist of: {
 * 	{string} name - Name of test,
 * 	{object} IODOpts - IOD options,
 *	{function} it - Array of functions to execute that validates test,
 *	{boolean} shouldError - True if test is expected to error
 * }
 *
 * @param {IOD} IOD - IOD object
 * @param {object} data - Prepared data for tests
 * @returns {Array} - List of ActionTests
 */
exports.tests = function(IOD, data) {
	var defParams = {
		field_text: 'EXISTS{}:WIKIPEDIA_CATEGORY',
		start: 1,
		max_page_results: 1,
		absolute_max_results: 1,
		indexes: 'wiki_eng',
		print: 'none',
		print_fields: 'content',
		highlight: 'off',
		min_date: 'blah',
		max_date: 'blah',
		min_score: 1,
		sort: 'off',
		total_results: true,
		start_tag: '<u>',
		end_tag: '</u>',
		summary: 'off'
	}

	return [
		{
			name: 'text=cats and dogs,ft,srt,mpr,i,p,pf,hl,md,mxd,ms,s,tr,st,et,sum',
			IODOpts: {
				action: T.attempt(U.paths.FINDSIM, action)(IOD),
				params: _.defaults({ text: 'cats and dogs' }, defParams)
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'url=idolondemand.com,ft,srt,mpr,i,p,pf,hl,md,mxd,ms,s,tr,st,et,sum',
			IODOpts: {
				action: T.attempt(U.paths.FINDSIM, action)(IOD),
				params: _.defaults({
					url: 'http://www.idolondemand.com'
				}, defParams)
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'reference=findsimilar,ft,srt,mpr,i,p,pf,hl,md,mxd,ms,s,tr,st,et,sum',
			IODOpts: {
				action: T.attempt(U.paths.FINDSIM, action)(IOD),
				params: _.defaults({
					reference: T.attempt(T.get('ref'))(data)
				}, defParams)
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'file=cats and dogs,ft,srt,mpr,i,p,pf,hl,md,mxd,ms,s,tr,st,et,sum',
			IODOpts: {
				action: T.attempt(U.paths.FINDSIM, action)(IOD),
				params: defParams,
				files: [filePath]
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'file=invalid,ft,srt,mpr,i,p,pf,hl,md,mxd,ms,s,tr,st,et,sum',
			IODOpts: {
				action: T.attempt(U.paths.FINDSIM, action)(IOD),
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
 * @param {function} done - Function(data)
 * @throws {Error} - If error on storeobject action
 * @throws {Error} - If couldn't find reference in results
 */
exports.prepare = function(IOD, done) {
	// Can use same reference as findrelatedconcepts
	U.prepareReference(IOD, 'findrelatedconcepts', filePath, function(ref) {
		done({ ref: ref })
	})
}