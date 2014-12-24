/**
 * Test data for findrelatedconcepts action.
 */

'use strict';

var U = require('../utils')
var ASTests = require('../action-schema-tests-utils')

var _ = require('lodash')
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
		ASTests.noInputs(IOD, 'FRC', action),
		ASTests.invalidStringType(IOD, 'field_text', 'DT', alias),
		ASTests.invalidStringType(IOD, 'indexes', 'FRC', action),
		ASTests.invalidStringType(IOD, 'database_match', 'DT', alias),
		ASTests.invalidStringType(IOD, 'min_date', 'FRC', action),
		ASTests.invalidStringType(IOD, 'max_date', 'DT', alias),
		ASTests.invalidNumberType(IOD, 'min_score', 'FRC', action),
		ASTests.invalidNumberType(IOD, 'sample_size', 'DT', alias),
		ASTests.invalidNumberType(IOD, 'max_results', 'FRC', action)
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
			it: U.defIt(action)
		},
		{
			name: 'url=idolondemand.com,ft,ss,mr,indexes,md,maxd,ms',
			IODOpts: {
				action: T.attempt(U.paths.DT, alias)(IOD),
				params: _.defaults({
					url: 'http://www.idolondemand.com'
				}, defParams)
			},
			it: U.defIt(alias)
		},
		{
			name: 'reference=findrelatedconcepts,ft,ss,mr,indexes,md,maxd,ms',
			IODOpts: {
				action: T.attempt(U.paths.FRC, action)(IOD),
				params: _.defaults({
					reference: T.attempt(T.get('ref'))(data)
				}, defParams)
			},
			it: U.defIt(action)
		},
		{
			name: 'file=cats and dogs,ft,ss,mr,indexes,md,maxd,ms',
			IODOpts: {
				action: T.attempt(U.paths.DT, alias)(IOD),
				params: defParams,
				files: [filePath]
			},
			it: U.defIt(alias)
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
 * @param {Function} done - Function(data)
 * @throws {Error} - If error on storeobject action
 * @throws {Error} - If couldn't find reference in results
 */
exports.prepare = function(IOD, done) {
	U.prepare.reference(IOD, action, filePath, function(err, ref) {
		done({ ref: ref })
	})
}