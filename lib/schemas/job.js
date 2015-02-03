/**
 * Schema for JOB request type.
 * @module lib/schemas/job
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
				"description": "Major version, eg. /<majorVersion>/job."
			},
			"job": {
				"type": "object",
				"properties": {
					"actions": {
						"type": "array",
						"items": {
							"type": "object",
							"properties": {
								/**
								 * For list of available actions look at:
								 * https://www.idolondemand.com/developer/docs/APIDiscovery.html
								 */
								"name": actions.API ? {
									"enum": actions.API,
									"description": "IOD api action."
								} : {
									"type": "string",
									"description": "IOD api action. New instance of IOD object has no validation on action."
								},
								// For list of possible apiVersions look at versions.js
								"version": {
									"enum": apiVersions,
									"default": "v1",
									"description": "Api versions, eg. /1/api/sync/listindex/<apiVersion>."
								},
								"params": {
									"type": "object",
									"properties": {
										"file": {
											"type": "string",
											"description": "Name of file that is uploaded to use for this action."
										}
									},
									"description": "IOD action parameters. Should be key value pairs."
								}
							},
							"required": ["name"]
						}
					},
					"description": "Array of action objects."
				},
				"description": "IOD job parameter.",
				"required": ["actions"]
			},
			"files": {
				"type": "array",
				"items": {
					"type": "object",
					"properties": {
						"name": {
							"type": "string",
							"description": "Name of file parameter."
						},
						"path": {
							"type": "string",
							"description": "Path to file."
						}
					},
					"required": ["name", "path"]
				},
				"description": "IOD job input files. Should be array of objects with file paths and name of file parameter."
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
		"required": [ "job" ],
		// Internal use
		"validation": actions.API ? "job" : 'iod'
	}
}