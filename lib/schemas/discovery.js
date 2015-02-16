/**
 * Schema for DISCOVERY request type.
 * @module lib/schemas/discovery
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
				"description": "Major version, eg. /<majorVersion>/discovery/api."
			},
			// IOD request only allows get or post
			"method": {
				"enum": ["get", "post"],
				"default": "get",
				"description": "Http method."
			},
			// For list of possible actions look at actions.js `DISCOVERY`
			"action": {
				"enum": actions.DISCOVERY,
				"description": "IOD descovery actions."
			},
			"params": {
				"type": "object",
				"description": "IOD action parameters. Should be key value pairs."
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
		"required": [ "action" ]
	}
}