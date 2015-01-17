/**
 * Schema for STATUS request type.
 * @module lib/schemas/status
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
				"description": "Major version, eg. /<majorVersion>/job/status/jobid."
			},
			"method": {
				"enum": ["get", "post"],
				"default": "get",
				"description": "Http method."
			},
			"jobId": {
				"type": "string",
				"description": "Job id returned from asynchronous request."
			}
		},
		"required": [ "jobId" ]
	}
}