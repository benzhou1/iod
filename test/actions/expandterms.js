/**
 * Test data for expandterms action.
 */

'use strict';

var U = require('../utils')
var ASTests = require('../action-schema-tests-utils')

var _ = require('lodash')
var should = require('should')
var T = require('../../lib/transform')

var action = 'expandterms'
var alias = 'expandterm'
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
		ASTests.withRequired({ expansion: 'fuzzy' }).noInputs(IOD, 'EXPANDTERMS', action),
		ASTests.missingRequired(IOD, 'expansion', 'EXPANDTERM', alias),
		ASTests.invalidEnumValue(IOD, 'expansion', 'EXPANDTERMS', action),
		ASTests.invalidNumberType(IOD, 'max_terms', 'EXPANDTERM', alias),
		ASTests.invalidBooleanType(IOD, 'stemming', 'EXPANDTERMS', action),
		ASTests.invalidEnumValue(IOD, 'sort', 'EXPANDTERM', alias)
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
		expansion: 'fuzzy',
		max_terms: 1,
		stemming: true,
		sort: 'none'
	}

	return [
		{
			name: 'text=cats and dogs,exp,mt,stem,sort',
			IODOpts: {
				action: T.attempt(U.paths.EXPANDTERMS, action)(IOD),
				params: _.defaults({ text: 'cats and dogs' }, defParams)
			},
			it: U.defIt(action)
		},
		{
			name: 'url=idolondemand.com,exp,mt,stem,sort',
			IODOpts: {
				action: T.attempt(U.paths.EXPANDTERM, alias)(IOD),
				params: _.defaults({ url: 'http://www.idolondemand.com' }, defParams)
			},
			it: U.defIt(alias)
		},
		{
			name: 'reference=expandterms,exp,mt,stem,sort',
			IODOpts: {
				action: T.attempt(U.paths.EXPANDTERMS, action)(IOD),
				params: _.defaults({
					reference: T.attempt(T.get('ref'))(data)
				}, defParams)
			},
			it: U.defIt(action)
		},
		{
			name: 'file=cats and dogs,exp,mt,stem,sort',
			IODOpts: {
				action: T.attempt(U.paths.EXPANDTERM, alias)(IOD),
				params: defParams,
				files: [filePath]
			},
			it: U.defIt(alias)
		},
		{
			name: 'file=invalid,exp,mt,stem,sort',
			IODOpts: {
				action: T.attempt(U.paths.EXPANDTERMS, action)(IOD),
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