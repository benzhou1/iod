/**
 * Contains all constants.
 * @module lib/constants
 */

'use strict';

module.exports = {
	/**
	 * List of static actions.
	 */
	ACTIONS: {
		DISCOVERY: {
			API: 'api'
			// TODO: add additional discovery apis
		}
	},

	/**
	 * List of IOD request types.
	 */
	TYPES: {
		SYNC: 'sync',
		ASYNC: 'async',
		RESULT: 'result',
		STATUS: 'status',
		JOB: 'job',
		DISCOVERY: 'discovery'
	},

	/**
	 * List of all versions.
	 */
	VERSIONS: {
		MAJOR: {
			V1: '1'
		},
		API: {
			V1: 'v1'
		}
	}
}