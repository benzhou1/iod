/**
 * Test data for highlighttext action.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var T = require('../../lib/transform')

var action = 'highlighttext'
var alias = 'highlight'
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
		U.actSchemaTests.noInputs(IOD, 'HLTEXT', action, { highlight_expression: 'string' }),
		U.actSchemaTests.missingRequired(IOD, 'highlight_expression', 'HL', alias),
		U.actSchemaTests.invalidStringType(IOD, 'highlight_expression', 'HLTEXT', action),
		U.actSchemaTests.invalidStringType(IOD, 'start_tag', 'HL', alias),
		U.actSchemaTests.invalidStringType(IOD, 'end_tag', 'HLTEXT', action)
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
		highlight_expression: 'cats',
		start_tag: '<u>',
		end_tag: '</u>'
	}

	return [
		{
			name: 'text=cats and dogs,hlexp=cats,st=<u>,et=</u>',
			IODOpts: {
				action: T.attempt(U.paths.HLTEXT, action)(IOD),
				params: _.defaults({ text: 'cats and dogs' }, defParams)
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'url=idolondemand.com,hlexp=cats,st=<u>,et=</u>',
			IODOpts: {
				action: T.attempt(U.paths.HL, alias)(IOD),
				params: _.defaults({ url: 'http://www.idolondemand.com' }, defParams)
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, alias)
			]
		},
		{
			name: 'reference=expandterms,hlexp=cats,st=<u>,et=</u>',
			IODOpts: {
				action: T.attempt(U.paths.HLTEXT, action)(IOD),
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
			name: 'file=cats and dogs,hlexp=cats,st=<u>,et=</u>',
			IODOpts: {
				action: T.attempt(U.paths.HL, alias)(IOD),
				params: defParams,
				files: [filePath]
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, alias)
			]
		},
		{
			name: 'file=invalid,hlexp=cats,st=<u>,et=</u>',
			IODOpts: {
				action: T.attempt(U.paths.HLTEXT, action)(IOD),
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
	U.prepare.reference(IOD, 'findrelatedconcepts', filePath, function(err, ref) {
		done({ ref: ref })
	})
}