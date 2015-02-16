/**
 * Schema for RESULT request type.
 * @module lib/schemas/result
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
				"description": "Major version, eg. /<majorVersion>/job/result/jobid."
			},
			"method": {
				"enum": ["get", "post"],
				"default": "get",
				"description": "Http method."
			},
			"jobId": {
				"type": "string",
				"description": "Job id returned from asynchronous request."
			},
			"retries": {
				"type": "integer",
				"description": "Number of times to retry on timeout.",
				"default": 3
			}
		},
		"required": [ "jobId" ]
	}
}