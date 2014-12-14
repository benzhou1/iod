/**
 * Test data for viewdocument action.
 */

'use strict';

var U = require('../utils')
var ASTests = require('../action-schema-tests-utils')

var _ = require('lodash')
var should = require('should')
var T = require('../../lib/transform')

var action = 'viewdocument'
var alias = 'view'
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
		ASTests.noInputs(IOD, 'VIEWDOC', action),
		ASTests.invalidBooleanType(IOD, 'raw_html', 'VIEW', alias),
		ASTests.invalidArrayString(IOD, 'highlight_expression', 'VIEWDOC', action),
		ASTests.invalidArrayString(IOD, 'start_tag', 'VIEW', alias),
		ASTests.invalidArrayString(IOD, 'end_tag', 'VIEWDOC', action),

		{
			name: 'unequal pair length highlight_expression-start_tag',
			IODOpts: {
				action: T.attempt(U.paths.VIEW, alias)(IOD),
				params: {
					url: 'url',
					highlight_expression: ['hlexp', 'hlexp'],
					start_tag: '<b>'
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInError, 'pairs')
			]
		},
		{
			name: 'unequal pair length highlight_expression-end_tag',
			IODOpts: {
				action: T.attempt(U.paths.VIEWDOC, action)(IOD),
				params: {
					url: 'url',
					highlight_expression: ['hlexp', 'hlexp'],
					end_tag: '</b>'
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInError, 'pairs')
			]
		}
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
		highlight_expression: 'text',
		start_tag: '<u>',
		end_tag: '</u>',
		raw_html: false
	}

	return [
		{
			name: 'url=google.com,hlexp=text,st=<u>,et=</u>',
			IODOpts: {
				action: T.attempt(U.paths.VIEWDOC, action)(IOD),
				params: _.defaults({ url: 'http://www.google.com'}, defParams)
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'reference=viewdocument,hlexp=text,st=<u>,et=</u>',
			IODOpts: {
				action: T.attempt(U.paths.VIEW, alias)(IOD),
				params: _.defaults({
					reference: T.attempt(T.get('ref'))(data)
				}, defParams)
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, alias)
			]
		},
		{
			name: 'file=viewdocument,hlexp=text,st=<u>,et=</u>',
			IODOpts: {
				action: T.attempt(U.paths.VIEWDOC, action)(IOD),
				params: defParams,
				files: [filePath]
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'file=invalid,hlexp=text,st=<u>,et=</u>',
			IODOpts: {
				action: T.attempt(U.paths.VIEW, alias)(IOD),
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
	// Can use same reference as analyzesentiment
	U.prepare.reference(IOD, 'analyzesentiment', filePath, function(err, ref) {
		done({ ref: ref })
	})
}
