#IOD.js

For the entire README, I will be refering to the IOD.js package as **IOD** and the Idol on Demand server as **Idol on Demand**.

IOD is an Idol on Demand framework which makes it to send api requests to Idol on Demand. It is easy to make all the [different types of request](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm) along with the [different allowed actions](https://www.idolondemand.com/developer/docs/APIDiscovery.html).

If you are new to what Idol on Demand has to offer, check out their website at: [Idol on Demand](http://www.idolondemand.com)

IOD provides client side schema validation of all allowed actions before sending your request off to Idol on Demand. It uses the request package to handle all http request and file uploads for you. The only thing you need to know is how to create an `IODOpt` object. Each IOD request type has their own JSON schema for creating the `IODOpt` object described by [Json-Schema](http://json-schema.org).

# Quick Start Guide

To make an Idol on Demand request, simply create an IOD object with the `create` method. Pass in your Idol on Demand api key, and a callback that accepts an error as the first argument and the IOD object that has been created as the second argument.

The reason the create function accepts a callback is because it is asynchronous. IOD is going to take your api key and get all the allowed actions for the api key and load in all the schemas for each action.

With the IOD object, you can make a request by simply creating an `IODOpts` object following the schema of your request type. In this example we will be making a `sync` request with `analyzesentiment` action.

```javascript
var iod = IOD.create('my api key', function(err, IOD) {
	console.log('ERROR: ', err)
	console.log('IOD: ', IOD)
	
	// IODOpts object for sync request with analyzesentiment action
	var IODOpts = {
		majorVersion: IOD.VERSIONS.MAJOR.V1,
		action: IOD.ACTIONS.API.ANALYZESENTIMENT,
		apiVersion: IOD.VERSIONS.API.V1,
		method: 'get',
		params: {
			text: '=)'
		}
	}
	
	IOD.sync(IODOpts, function(err, res) {
		console.log('SYNC ERROR: ', err)
		console.log('RESPONSE: ', res)
		
		/* RESPONSE: {
		  "positive": [
		    {
		      "sentiment": "=)",
		      "topic": null,
		      "score": 0.6280145725181376,
		      "original_text": "=)",
		      "original_length": 2,
		      "normalized_text": "=)",
		      "normalized_length": 2
		    }
		  ],
		  "negative": [],
		  "aggregate": {
		    "sentiment": "positive",
		    "score": 0.6280145725181376
		  }
		}
		*/
	})
})
```

## Documentation

### Constants
* [`ACTIONS`](#actions)
* [`TYPES`](#types)
* [`VERSIONS`](#versions)

### Schemas
* [`ASYNC`](#asyncSchema)
* [`SYNC`](#syncSchema)
* [`JOB`](#jobSchema)
* [`STATUS`](#statusSchema)
* [`RESULT`](#resultSchema)
* [`DISCOVERY`](#discoverySchema)

### Methods
* [`async`](#async)
* [`sync`](#sync)
* [`job`](#job)
* [`status`](#status)
* [`result`](#result)
* [`discovery`](#discovery)

# Constants

<a name="actions" />
#### `ACTIONS` - List of all the different allowed actions

There are two types of actions:

1. `ACTIONS.DISCOVERY`
  * [`ACTIONS.DISCOVERY.API`](https://www.idolondemand.com/developer/docs/APIDiscovery.html)
2. `ACTIONS.API`
  * List of allowed actions and their aliases from [`API`](https://www.idolondemand.com/developer/docs/APIDiscovery.html).
  * (e.g. `ACTIONS.API.EXTRACTEXT`)
  
<a name="types" />
#### `TYPES` - List of all different request types

1. [`TYPES.ASYNC`](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm)
2. [`TYPES.SYNC`](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm)
3. [`TYPES.JOB`](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm)
4. [`TYPES.STATUS`](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm)
5. [`TYPES.RESULT`](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm)
6. [`TYPES.DISCOVERY`](https://www.idolondemand.com/developer/docs/APIDiscovery.html)

<a name="versions" />
#### `VERSIONS` - List of all versions

There are two types of versions:

1. `VERSIONS.MAJOR` (eg. /`<majorVersion>`/api/sync/listindex/v1)
  * `VERSIONS.MAJOR.V1` - initial version
2. `VERSIONS.API`(eg. /1/api/sync/listindex/`<apiVersion>`)
  * `VERSIONS.API.V1` - initial version

# Methods

<a name="async" />
### async(IODOpts, callback)

Makes an async request to Idol on Demand with options specified from `IODOpts`.

#### Parameters
* `IODOpts` - IOD options (see Async Schema)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from Idol on Demand as its second `res`.

<a name="asyncSchema" />
#### Schema
```javascript
{
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
		"action": {
			"enum": actions.API,
			"description": "IOD api action."
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
			"description": "Http method"
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
			"description": "True to wait for results of action to be available"
		}
	},
	"required": [ "action" ]
}
```

#### Example
```javascript
// IODOpts for async request
var IODOpts = {
	majorVersion: IOD.VERSIONS.MAJOR.V1,
	action: IOD.ACTIONS.API.ANALYZESENTIMENT,
	apiVersion: IOD.VERSIONS.API.V1,
	method: 'get',
	params: {
		text: '=)'
	},
	getResults: false
}

IOD.async(IODOpts, function(err, res) {
	console.log('ERROR: ', err)
	console.log('RESPONSE: ', res)
})
```

#### Example with file
```javascript
// IODOpts for async request with a file. Using default values.
var IODOpts = {
	action: IOD.ACTIONS.API.ANALYZESENTIMENT,
	files: ['path/to/file']
}

IOD.async(IODOpts, function(err, res) {
	console.log('ERROR: ', err)
	console.log('RESPONSE: ', res)
})
```

<a name="sync" />
### sync(IODOpts, callback)

Makes an sync request to Idol on Demand with options specified from `IODOpts`.

#### Parameters
* `IODOpts` - IOD options (see Sync Schema)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from Idol on Demand as its second `res`.

<a name="syncSchema" />
#### Schema
```javascript
{
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
		"action": {
			"enum": actions.API,
			"description": "IOD action."
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
			"description": "Http method"
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
		}
	},
	"required": [ "action" ]
}
```

#### Example
```javascript
// IODOpts for sync request
var IODOpts = {
	majorVersion: IOD.VERSIONS.MAJOR.V1,
	action: IOD.ACTIONS.API.ANALYZESENTIMENT,
	apiVersion: IOD.VERSIONS.API.V1,
	method: 'get',
	params: {
		text: '=)'
	}
}

IOD.sync(IODOpts, function(err, res) {
	console.log('ERROR: ', err)
	console.log('RESPONSE: ', res)
})
```

#### Example with file
```javascript
// IODOpts for sync request with a file. Using default values.
var IODOpts = {
	action: IOD.ACTIONS.API.ANALYZESENTIMENT,
	files: ['path/to/file']
}

IOD.sync(IODOpts, function(err, res) {
	console.log('ERROR: ', err)
	console.log('RESPONSE: ', res)
})
```

<a name="job" />
### job(IODOpts, callback)

Makes a job request to Idol on Demand with options specified from `IODOpts`.

#### Parameters
* `IODOpts` - IOD options (see Job Schema)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from Idol on Demand as its second `res`.

<a name="jobSchema" />
#### Schema
```javascript
{
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
							"name": {
								"enum": actions.API,
								"description": "IOD action."
							},
							// For list of possible apiVersions look at versions.js
							"version": {
								"enum": apiVersions,
								"default": "v1",
								"description": "Api versions, eg. /1/api/sync/listindex/<apiVersion>."
							},
							"params": {
								"type": "object",
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
			"description": "True to wait for results of action to be available"
		}
	},
	"required": [ "job" ]
}
```

#### Example
```javascript
// IODOpts for job request
var IODOpts = {
	majorVersion: IOD.VERSIONS.MAJOR.V1,
	job: {
		actions: [
			{
				name: IOD.ACTIONS.API.ANALYZESENTIMENT,
				version: IOD.VERSIONS.API.V1,
				params: {
					text: '=)'
				}
			},
			{
				name: IOD.ACTIONS.API.ANALYZESENTIMENT,
				version: IOD.VERSIONS.API.V1,
				params: {
					text: '=('
				}
			}
		]
	},
	getResults: false
}

IOD.job(IODOpts, function(err, res) {
	console.log('ERROR: ', err)
	console.log('RESPONSE: ', res)
})
```

#### Example with file
```javascript
// IODOpts for job request with a file. Using default values.
var IODOpts = {
	job: {
		actions: [
			{
				name: IOD.ACTIONS.API.ANALYZESENTIMENT,
				params: {
					file: 'name for the file'
				}
			},
			{
				name: IOD.ACTIONS.API.ANALYZESENTIMENT,
				params: {
					file: 'another name for the file1'
				}
			}
		]
	},
	files: [
		{
			name: 'name for the file',
			path: 'path/to/file'
		},
		{
			name: 'another name for the file1',
			path: 'path/to/file1'
		},
	]
}

IOD.job(IODOpts, function(err, res) {
	console.log('ERROR: ', err)
	console.log('RESPONSE: ', res)
})
```

<a name="status" />
### status(IODOpts, callback)

Makes a status request to Idol on Demand with options specified from `IODOpts`.

#### Parameters
* `IODOpts` - IOD options (see Status Schema)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from Idol on Demand as its second `res`.

<a name="statusSchema" />
#### Schema
```javascript
{
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
			"description": "Http method"
		},
		"jobId": {
			"type": "string",
			"description": "Job id returned from asynchronous request"
		}
	},
	"required": [ "jobId" ]
}
```

#### Example
```javascript
// IODOpts for status request
var IODOpts = {
	majorVersion: IOD.VERSIONS.MAJOR.V1,
	method: 'get',
	jobId: 'Job id of your async/job request'
}

IOD.status(IODOpts, function(err, res) {
	console.log('ERROR: ', err)
	console.log('RESPONSE: ', res)
})
```

<a name="result" />
### result(IODOpts, callback)

Makes a result request to Idol on Demand with options specified from `IODOpts`.

#### Parameters
* `IODOpts` - IOD options (see Result Schema)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from Idol on Demand as its second `res`.

<a name="resultSchema" />
#### Schema
```javascript
{
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
			"description": "Http method"
		},
		"jobId": {
			"type": "string",
			"description": "Job id returned from asynchronous request"
		}
	},
	"required": [ "jobId" ]
}
```

#### Example
```javascript
// IODOpts for result request
var IODOpts = {
	majorVersion: IOD.VERSIONS.MAJOR.V1,
	method: 'get',
	jobId: 'Job id of your async/job request'
}

IOD.result(IODOpts, function(err, res) {
	console.log('ERROR: ', err)
	console.log('RESPONSE: ', res)
})
```

<a name="discovery" />
### discovery(IODOpts, callback)

Makes a discovery api request to Idol on Demand with options specified from `IODOpts`.

#### Parameters
* `IODOpts` - IOD options (see Discovery Schema)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from Idol on Demand as its second `res`.

<a name="discoverySchema" />
#### Schema
```javascript
{
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
			"description": "Http method"
		},
		// For list of possible actions look at actions.js `DISCOVERY`
		"action": {
			"enum": actions.DISCOVERY,
			"description": "IOD descovery actions."
		}
	},
	"required": [ "action" ]
}
```

#### Example
```javascript
// IODOpts for discovery request
var IODOpts = {
	majorVersion: IOD.VERSIONS.MAJOR.V1,
	method: 'get',
	action: IOD.ACTIONS.DISCOVERY.API,
	params: {
		max_results: 10
	}
}

IOD.discovery(IODOpts, function(err, res) {
	console.log('ERROR: ', err)
	console.log('RESPONSE: ', res)
})
```



 



