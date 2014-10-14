/**
 * Test data for findrelatedconcepts action.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var T = require('../../lib/transform')

var action = 'findrelatedconcepts'
var alias = 'dynamicthesaurus'
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
		U.actSchemaTests.noinput(IOD, 'FRC', action),

		{
			name: 'invalid string for field_text',
			IODOpts: {
				action: T.attempt(U.paths.DT, alias)(IOD),
				params: {
					field_text: [1, 2, 3]
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'field_text')
			]
		},
		{
			name: 'invalid number for sample_size',
			IODOpts: {
				action: T.attempt(U.paths.FRC, action)(IOD),
				params: {
					sample_size: 'not a number'
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'sample_size')
			]
		},
		{
			name: 'invalid number for max_results',
			IODOpts: {
				action: T.attempt(U.paths.DT, alias)(IOD),
				params: {
					max_results: 'not a number'
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'max_results')
			]
		},
		{
			name: 'invalid string for indexes',
			IODOpts: {
				action: T.attempt(U.paths.FRC, action)(IOD),
				params: {
					indexes: [1, 2, 3]
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'indexes')
			]
		},
		{
			name: 'invalid string for min_date',
			IODOpts: {
				action: T.attempt(U.paths.DT, alias)(IOD),
				params: {
					min_date: [1, 2, 3]
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'min_date')
			]
		},
		{
			name: 'invalid string for max_date',
			IODOpts: {
				action: T.attempt(U.paths.FRC, action)(IOD),
				params: {
					max_date: [1, 2, 3]
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'max_date')
			]
		},
		{
			name: 'invalid number for min_score',
			IODOpts: {
				action: T.attempt(U.paths.DT, alias)(IOD),
				params: {
					min_score: 'not a number'
				}
			},
			it: [
				U.shouldError,
				_.partial(U.shouldBeInSchemaError, 'type', 'min_score')
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
		field_text: 'EXISTS{}:WIKIPEDIA_CATEGORY',
		sample_size: 1,
		max_results: 1,
		indexes: 'wiki_eng',
		min_date: 'blah',
		max_date: 'blah',
		min_score: 1
	}

	return [
		{
			name: 'text=cats and dogs,ft,ss,mr,indexes,md,maxd,ms',
			IODOpts: {
				action: T.attempt(U.paths.FRC, action)(IOD),
				params: _.defaults({ text: 'cats and dogs' }, defParams)
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'url=idolondemand.com,ft,ss,mr,indexes,md,maxd,ms',
			IODOpts: {
				action: T.attempt(U.paths.DT, alias)(IOD),
				params: _.defaults({
					url: 'http://www.idolondemand.com'
				}, defParams)
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, alias)
			]
		},
		{
			name: 'reference=findrelatedconcepts,ft,ss,mr,indexes,md,maxd,ms',
			IODOpts: {
				action: T.attempt(U.paths.FRC, action)(IOD),
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
			name: 'file=cats and dogs,ft,ss,mr,indexes,md,maxd,ms',
			IODOpts: {
				action: T.attempt(U.paths.DT, alias)(IOD),
				params: defParams,
				files: [filePath]
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, alias)
			]
		},
		{
			name: 'file=invalid,ft,ss,mr,indexes,md,maxd,ms',
			IODOpts: {
				action: T.attempt(U.paths.FRC, action)(IOD),
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
	U.prepareReference(IOD, action, filePath, function(ref) {
		done({ ref: ref })
	})
}