/**
 * Test data for getcontent action.
 */

'use strict';

var U = require('../utils')
var ASTests = require('../action-schema-tests-utils')

var _ = require('lodash')
var should = require('should')
var T = require('../../lib/transform')

var action = 'getcontent'

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
		ASTests.missingRequired(IOD, 'index_reference', 'GETCONT', action),
		ASTests.invalidArrayString(IOD, 'index_reference', 'GETCONT', action),
		ASTests.invalidStringType(IOD, 'indexes', 'GETCONT', action),
		ASTests.invalidStringType(IOD, 'database_match', 'GETCONT', action),
		ASTests.invalidStringType(IOD, 'highlight_expression', 'GETCONT', action),
		ASTests.invalidStringType(IOD, 'start_tag', 'GETCONT', action),
		ASTests.invalidStringType(IOD, 'end_tag', 'GETCONT', action),
		ASTests.invalidEnumValue(IOD, 'print', 'GETCONT', action),
		ASTests.invalidStringType(IOD, 'print_fields', 'GETCONT', action)
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
		index_reference: [
			'http://en.wikipedia.org/wiki/Alan Turing',
			'http://en.wikipedia.org/wiki/Taylor Swift'
		],
		indexes: 'wiki_eng',
		highlight_expression: 'Alan Turing',
		start_tag: '<u>',
		end_tag: '</u>',
		print: 'none',
		print_fields: 'content'
	}

	return [
		{
			name: 'index_reference=Alan Turing+Taylor Swift,i,he,st,et,pr,prf',
			IODOpts: {
				action: T.attempt(U.paths.GETCONT, action)(IOD),
				params: defParams
			},
			it: U.defIt(action)
		},
		{
			name: 'file=invalid,ft,ss,mr,indexes,md,maxd,ms',
			IODOpts: {
				action: T.attempt(U.paths.GETCONT, action)(IOD),
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
	return done()
}