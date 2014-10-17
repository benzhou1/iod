#IOD.js

For the entire README, I will be refering to the IOD.js package as **IOD** and the IDOL onDemand server as **IDOL onDemand**.

IOD is an IDOL onDemand framework which makes it easy to send api requests to IDOL onDemand. It is easy to make all the [different types of request](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm) along with the [different allowed actions](https://www.idolondemand.com/developer/docs/APIDiscovery.html) that are available to you.

If you are new to what IDOL onDemand has to offer, check out their website at: [IDOL onDemand](http://www.idolondemand.com)

IOD provides client side schema validation of all allowed actions before sending your request off to IDOL onDemand. It also handles validation for action aliases and parameter aliases. Required input sources and array parameters that are required to have the same length are validated as well. It uses the request package to handle all http request and file uploads for you. The only thing you need to know is how to create an `IODOpt` object. Each IOD request type has their own JSON schema for creating the `IODOpt` object described by [Json-Schema](http://json-schema.org).

If you are behind a proxy, all you need to do is modify the `HTTP_PROXY` and `HTTPS_PROXY` environment variables (i.e. `http://10.5.16.105:8080`). If you don't want proxy to be applied to certain host, just modify the `NO_PROXY` environment variable with comma serparated list of host to not apply proxy to. Wildcards are allowed (i.e. `localhost,10.*`).

# Quick Start Guide

### 1.) IOD object via `create` method

To make an IDOL onDemand request, simply create an IOD object with the `create` method. Pass in your IDOL onDemand api key, and a callback that accepts an error as the first argument and the IOD object that has been created as the second argument.

The reason the create function accepts a callback is because it is asynchronous. IOD is going to take your api key and get all the allowed actions for the api key and load in all the schemas for each action.

With the IOD object, you can make a request by simply creating an `IODOpts` object following the schema of your request type. In this example we will be making a `sync` request with `analyzesentiment` action.

```javascript
var iod = require('IOD')

iod.create('my api key', function(err, IOD) {
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

### 2.) Creating new instance of IOD

To make an IDOL onDemand request, simply create a new instance of IOD class and pass in your IDOL onDemand api key.

This method is synchronous and will return you a new IOD object right away, but the tradeoff with this approach is that no client side validation will be done for you. The avialible actions for your api key will not be loaded.

With the IOD object, you can make a request by simply creating an `IODOpts` object following the schema of your request type. In this example we will be making a `sync` request with `analyzesentiment` action.

```javascript
var iod = require('IOD')
var IOD = new iod('my api key')

// IODOpts object for sync request with analyzesentiment action
var IODOpts = {
	majorVersion: IOD.VERSIONS.MAJOR.V1,
	// ACTIONS aren't loaded with your availible actions
	action: 'analyzesentiment',
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
```

# Advance Usage

When creating a IOD object either through `create` method or creating new instance of IOD class, you are allowed to override the Idolon Demand host and Idolon Demand port. By default the host and port will point to `'https://api.idolondemand.com'` and `443` respectively. As mentioned above, IOD uses request package, therefore you can also override any [request options](https://www.npmjs.org/package/request) availible.

### 1.) Overriding Idolon Demand host and port

```javascript
var iod = require('IOD')

// via create method
iod.create('my api key', 'override host', 8080, function(err, IOD) {
	console.log('ERROR: ', err)
	console.log('Idolon Demand host: ', IOD.host)
	console.log('Idolon Demand port: ', IOD.port)
})

// new instance of IOD class
var IOD = new iod('my api key', 'override host', 8080)
console.log('Idolon Demand host: ', IOD.host)
console.log('Idolon Demand port: ', IOD.port)
```

### 2.) Overriding request options

```javascript
var iod = require('IOD')

// via create method
iod.create('my api key', { timeout: 50000, jar: true }, function(err, IOD) {
	console.log('ERROR: ', err)
	console.log('Request options: ', IOD.reqOpts)
})

// new instance of IOD class
var IOD = new iod('my api key', { timeout: 50000, jar: true })
console.log('Request options: ', IOD.reqOpts)
```

# Documentation

### Constants
* [`ACTIONS`](#actions)
* [`TYPES`](#types)
* [`VERSIONS`](#versions)
* [`schemas`](#constSchemas)

### Schemas
* [`ASYNC`](#asyncSchema)
* [`SYNC`](#syncSchema)
* [`JOB`](#jobSchema)
* [`STATUS`](#statusSchema)
* [`RESULT`](#resultSchema)
* [`DISCOVERY`](#discoverySchema)

### Methods
* [`create`](#create)
* [`async`](#async)
* [`sync`](#sync)
* [`job`](#job)
* [`status`](#status)
* [`result`](#result)
* [`discovery`](#discovery)

# IOD

### new IOD(IODOpts, [Optional host], [Optional port], [Optional reqOpts], callback)

Creats a new instance of IOD class. Available actions for your api key will not be loaded. There will be no client-side validation for IDOL onDemand actions. Use with care.

#### Parameters
* `IODOpts` - IOD options (see Schema below)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from IDOL onDemand as its second `res`.


# Constants

<a name="actions" />
#### `ACTIONS` - Object with properties containing all the different allowed actions

There are two types of actions:

1. `ACTIONS.DISCOVERY`
  * [`ACTIONS.DISCOVERY.API`](https://www.idolondemand.com/developer/docs/APIDiscovery.html)
2. `ACTIONS.API`
  * List of allowed actions and their aliases from [`API`](https://www.idolondemand.com/developer/docs/APIDiscovery.html).
  * This only exists if IOD object is created via `create` method.
  * (e.g. `ACTIONS.API.EXTRACTEXT`)
  
<a name="types" />
#### `TYPES` - Object with properties containing the all different request types

1. [`TYPES.ASYNC`](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm)
2. [`TYPES.SYNC`](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm)
3. [`TYPES.JOB`](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm)
4. [`TYPES.STATUS`](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm)
5. [`TYPES.RESULT`](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm)
6. [`TYPES.DISCOVERY`](https://www.idolondemand.com/developer/docs/APIDiscovery.html)

<a name="versions" />
#### `VERSIONS` - Object with properties containing all the versions

There are two types of versions:

1. `VERSIONS.MAJOR` (e.g. /`<majorVersion>`/api/sync/listindex/v1)
  * `VERSIONS.MAJOR.V1` - initial version
2. `VERSIONS.API`(e.g. /1/api/sync/listindex/`<apiVersion>`)
  * `VERSIONS.API.V1` - initial version

<a name="constSchemas" />
#### `schemas` - Contains all action schema related data 
This only exists if IOD object is created via `create` method

1. `schemas.schema` (object containing parameter and response schema for every allowed action)
  * Property names are `<Idolon Demand action name>`.`<parameters or response>` (e.g. schemas.schema['analyzesentiment.parameters'])
  * Property values are the parameter schema or response schema for that action.
2. `schemas.parameters` (object containing all parameters for every allowed action)
  * Property names are `<Idolon Demand action name>` (e.g. `schemas.parameters.analyzesentiment`)
  * Property values are list of all parameters for that action.
3. `schemas.inputs` (object containing all input sources for every allowed action)
  * Property names are `<Idolon Demand action name>` (e.g. `schemas.inputs.analyzesentiment`)
  * Property values are list of all input sources for that action.
4. `schemas.pairs` (object containing all parameter pairs for every allowed action)
  * Property names are `<Idolon Demand action name>` (e.g. `schemas.pairs.analyzesentiment`)
  * Property values are objects where the property name refers to the main parameter in the pair and the value refers to a list of all parameters that the main parameters is paired with. (e.g. `schemas.pairs.viewdocument.highlight_expression` -> `['start_tag', 'end_tag']`)


# Methods

<a name="create" />
### create(apiKey, [Optional IODhost], [Optional IODport], callback)

Creates an IOD object with specified `apiKey` and returns it as the second argument to `callback`. You can override the host and portm otherwise it will point to the IDOL onDemand server. The returned IOD object contain schemas loaded with all the actions that are available to the specified `apiKey`.

#### Parameters
* `apiKey` - Your IDOL onDemand api key
* `IODhost` - Can override IDOL onDemand host (for developers)
* `IODport` - Can override IDOL onDemand port (for developers)
* `callback` - `Callback(err, IOD)` that accepts an error as its first argument `err` and an IOD object as the second arugument `IOD`

#### Example
```javascript
IOD.create('api key', function(err, IOD) {
	console.log('ERROR: ', err)
	console.log('IOD: ', IOD)
})
```

<a name="async" />
### async(IODOpts, callback)

Makes an async request to IDOL onDemand with options specified from `IODOpts`. Async request returns a `jobId` in which case you can get the status/result of the action using the `status`/`result` methods. More information can be found [here](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm).

#### Parameters
* `IODOpts` - IOD options (see Schema below)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from IDOL onDemand as its second `res`.

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

Makes an sync request to IDOL onDemand with options specified from `IODOpts`. Sync request returns the result of the action right away. More information can be found [here](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm).

#### Parameters
* `IODOpts` - IOD options (see Schema below)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from IDOL onDemand as its second `res`.

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

Makes a job request to IDOL onDemand with options specified from `IODOpts`. Job request is asynchronous and allows you to send multiple actions at a time. It will return a `jobId` in which case you can get the status/result of the action by calling the `status`/`result` methods. More information can be found [here](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm).

#### Parameters
* `IODOpts` - IOD options (see Schema below)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from IDOL onDemand as its second `res`.

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

Makes a status request to IDOL onDemand with options specified from `IODOpts`. Status request returns the current status of a job based off `jobId`. More information can be found [here](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm).

#### Parameters
* `IODOpts` - IOD options (see Schema below)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from IDOL onDemand as its second `res`.

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

Makes a result request to IDOL onDemand with options specified from `IODOpts`. Result request waits until a job specified by `jobId` is finished or errored and returns the results. More information can be found [here](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm).

#### Parameters
* `IODOpts` - IOD options (see Schema below)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from IDOL onDemand as its second `res`.

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

Makes a discovery api request to IDOL onDemand with options specified from `IODOpts`. More information about discovery actions can be found [here](https://www.idolondemand.com/developer/docs/APIDiscovery.html).

#### Parameters
* `IODOpts` - IOD options (see Schema below)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from IDOL onDemand as its second `res`.

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



 



