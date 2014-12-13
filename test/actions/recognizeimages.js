/**
 * Test data for recognizeimages action.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var T = require('../../lib/transform')

var action = 'recognizeimages'
var alias = 'detectimage'
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
		U.actSchemaTests.noInputs(IOD, 'RECIMAGE', action),
		U.actSchemaTests.invalidEnumValue(IOD, 'indexes', 'DETIMAGE', alias),
		U.actSchemaTests.invalidEnumValue(IOD, 'database_match', 'RECIMAGE', action),
		U.actSchemaTests.invalidEnumValue(IOD, 'image_type', 'DETIMAGE', alias),
		U.actSchemaTests.invalidArrayString(IOD, 'image_type', 'RECIMAGE', action)
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
	return [
		{
			name: 'url=idolondemand.com/google.jpg,indexes=corporatelogos,it=3d',
			IODOpts: {
				action: T.attempt(U.paths.RECIMAGE, action)(IOD),
				params: {
					url: 'https://www.idolondemand.com/sample-content/images/google.jpg',
					indexes: 'corporatelogos',
					image_type: 'complex_3d'
				}
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'reference=recognizeimages,indexes=corporatelogos,it=3d',
			IODOpts: {
				action: T.attempt(U.paths.DETIMAGE, alias)(IOD),
				params: {
					reference: T.attempt(T.get('ref'))(data),
					indexes: 'corporatelogos',
					image_type: 'complex_3d'
				}
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, alias)
			]
		},
		{
			name: 'file=recognizeimages,indexes=corporatelogos,it=3d',
			IODOpts: {
				action: T.attempt(U.paths.RECIMAGE, action)(IOD),
				params: {
					indexes: 'corporatelogos',
					image_type: 'complex_3d'
				},
				files: [filePath]
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'file=invalid,indexes=corporatelogos,it=3d',
			IODOpts: {
				action: T.attempt(U.paths.DETIMAGE, alias)(IOD),
				params: {
					indexes: 'corporatelogos',
					image_type: 'complex_3d'
				},
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
