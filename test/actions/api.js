/**
 * Test data for api action.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var T = require('../../lib/transform')

var action = 'api'

/**
 * Specific type of action.
 */
exports.type = 'discovery'

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
	return []
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
	/**
	 * Validates that results is an array with 5 elements.
	 *
	 * @param {object} env - Environment object
	 */
	var shouldHaveResults = function(env) {
		env.response.should.be.an.Array
		_.size(env.response).should.be.eql(5)
	}

	return [
		{
			name: 'max_res=5,full_def=true,start=3,search_txt=index&cat=indexing',
			IODOpts: {
				action: T.attempt(U.paths.API, action)(IOD),
				params: {
					max_results: 5,
					full_definition: true,
					start: 3,
					search_text: 'index',
					category: 'indexing'
				}
			},
			it: [
				U.shouldBeSuccessful,
				shouldHaveResults
			]
		}
	]
}

exports.prepare = function(IOD, done) {
	done()
}