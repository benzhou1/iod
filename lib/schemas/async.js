/**
 * Schema for ASYNC request type.
 * @module lib/schemas/async
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
				"description": "Major version, eg. /<majorVersion>/api/async/listindex/v1."
			},
			/**
			 * For list of available actions look at:
			 * https://www.idolondemand.com/developer/docs/APIDiscovery.html api action
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
				"description": "Api versions, eg. /1/api/async/listindex/<apiVersion>."
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
			"getResults": {
				"type": "boolean",
				"description": "True to wait for results of action to be available."
			},
			"pollInterval": {
				"type": "integer",
				"description": "Number of ms to wait between polling results.",
				"default": 5000
			},
			"callback": {
				"type": "object",
				"properties": {
					"uri": {
						"type": "string",
						"description": "Uri to be called with a POST request containing results."
					},
					"method": {
						"enum": ["encoded", "multipart"],
						"default": "encoded",
						"description": "Method to send results, either urlencoded or multipart."
					}
				},
				"required": ["uri"],
				"description": "Object containing parameters for getting results through a callback."
			}
		},
		"required": [ "action" ],
		// Internal use
		"validation": actions.API ? "action" : 'iod'
	}
}