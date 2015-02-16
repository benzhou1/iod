/**
 * Schema for SYNC request type.
 * @module lib/schemas/sync
 */

'use strict';

module.exports = function(actions, majorVersions, apiVersions) {
	return {
		"type": "object",
		"properties": {
			// For list of possible majorVersions look at versions.js
			"majorVersion": {
				"enum": majorVersions,
				"default": "1",
				"description": "Major version, eg. /<majorVersion>/api/sync/listindex/v1."
			},
			/**
			 * For list of available actions look at:
			 * https://www.idolondemand.com/developer/docs/APIDiscovery.html
			 */
			"action": actions.API ? {
				"enum": actions.API,
				"description": "IOD api action."
			} : {
				"type": "string",
				"description": "IOD api action. New instance of IOD object has no validation on action."
			},
			// For list of possible apiVersions look at versions.js
			"apiVersion": {
				"enum": apiVersions,
				"default": "v1",
				"description": "Api versions, eg. /1/api/sync/listindex/<apiVersion>."
			},
			"method": {
				"enum": ["get", "post"],
				"default": "get",
				"description": "Http method."
			},
			"params": {
				"type": "object",
				"description": "IOD action parameters. Should be key value pairs."
			},
			"files": {
				"type": "array",
				"items": {
					"type": "string"
				},
				"description": "IOD action input files. Should be array of file paths."
			},
			"retries": {
				"type": "integer",
				"description": "Number of times to retry on timeout or unknown errors.",
				"default": 3
			},
			"errorCodes": {
				"type": "array",
				"items": {
					"type": "integer",
					"description": "Error code to retry on."
				},
				"description": "List of error codes. See https://www.idolondemand.com/developer/docs/ErrorCodes.html."
			}
		},
		"required": [ "action" ],
		// Internal use
		"validation": actions.API ? "action" : 'iod'
	}
}