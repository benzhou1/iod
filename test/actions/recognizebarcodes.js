/**
 * Test data for recognizebarcodes action.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var T = require('../../lib/transform')

var action = 'recognizebarcodes'
var alias = 'readbarcode'
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
		U.actSchemaTests.noInputs(IOD, 'RECBAR', action),
		U.actSchemaTests.invalidArrayString(IOD, 'barcode_type', 'READBAR', alias),
		U.actSchemaTests.invalidEnumValue(IOD, 'barcode_orientation', 'RECBAR', action),
		U.actSchemaTests.invalidEnumValue(IOD, 'barcode_type', 'READBAR', alias)
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
	return [
		{
			name: 'url=idolondemand.com/bc7.jpg,bt=all1d,bo=any',
			IODOpts: {
				action: T.attempt(U.paths.RECBAR, action)(IOD),
				params: {
					url: 'https://www.idolondemand.com/sample-content/barcode/bc2.jpg',
					barcode_type: 'all1d',
					barcode_orientation: 'any'
				}
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'reference=recognizebarcodes,bt=all1d,bo=any',
			IODOpts: {
				action: T.attempt(U.paths.READBAR, alias)(IOD),
				params: {
					reference: T.attempt(T.get('ref'))(data),
					barcode_type: 'all1d',
					barcode_orientation: 'any'
				}
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, alias)
			]
		},
		{
			name: 'file=recognizebarcodes,bt=all1d,bo=any',
			IODOpts: {
				action: T.attempt(U.paths.RECBAR, action)(IOD),
				params: {
					barcode_type: 'all1d',
					barcode_orientation: 'any'
				},
				files: [filePath]
			},
			it: [
				U.shouldBeSuccessful,
				_.partial(U.shouldHaveResults, action)
			]
		},
		{
			name: 'file=invalid,bt=all1d,bo=any',
			IODOpts: {
				action: T.attempt(U.paths.READBAR, alias)(IOD),
				params: {
					barcode_type: 'all1d',
					barcode_orientation: 'any'
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
 * @param {function} done - Function(data)
 * @throws {Error} - If error on storeobject action
 * @throws {Error} - If couldn't find reference in results
 */
exports.prepare = function(IOD, done) {
	U.prepare.reference(IOD, action, filePath, function(err, ref) {
		done({ ref: ref })
	})
}
