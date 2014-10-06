#IOD.js

For the entire README, I will be refering to the IOD.js package as **IOD** and the Idol on Demand server as **Idol on Demand**.

IOD is an Idol on Demand framework which makes it to send api requests to Idol on Demand. It is easy to make all the [different types of request](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm) along with the [different allowed actions](https://www.idolondemand.com/developer/docs/APIDiscovery.html).

If you are new to what Idol on Demand has to offer, check out their website at: [Idol on Demand](http://www.idolondemand.com)

IOD provides client side schema validation of all allowed actions before sending your request off to Idol on Demand. It uses the request package to handle all http request and file uploads for you. The only thing you need to know is how to create an `IODOpt` object. Each IOD request type has their own JSON schema for creating the `IODOpt` object described by [Json-Schema](http://json-schema.org).

## Async Request

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

## Discovery Request

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

## Job Request

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

## Result Request

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

## Status Request

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

## Sync Request

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

## Quick Start Guide
To make an Idol on Demand request, simple create an IOD object with the `create` method. Pass in your Idol on Demand api key, Idol on Demand host, Idol on Demand port and a callback that accepts an error as the first argument and the IOD object that has been created as the second argument.
```javascript
var iod = IOD.create('my api key', 'http://api.idolondemand.com', 80, function(err, IOD) {
	console.log('ERROR: ', err)
	console.log('IOD: ', IOD)
})
```
The reason the create function accepts a callback is because it is asynchronous. IOD is going to take your api key and get all the allowed actions for the api key and load in all the schemas for each action.

With the IOD object, you can make a request by simply creating an `IODOpts` object following the schema of your request type:

#### Async IODOpts
```javascript
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
```

#### Discovery IODOpts
```javascript
var IODOpts = {
	majorVersion: IOD.VERSIONS.MAJOR.V1,
	method: 'get',
	action: IOD.ACTIONS.DISCOVERY.API,
	params: {
		max_results: 10
	}
}
```

#### Job IODOpts
```javascript
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
```

#### Result IODOpts
```javascript
var IODOpts = {
	majorVersion: IOD.VERSIONS.MAJOR.V1,
	method: 'get',
	jobId: 'Job id of your async/job request'
}
```

#### Status IODOpts
```javascript
var IODOpts = {
	majorVersion: IOD.VERSIONS.MAJOR.V1,
	method: 'get',
	jobId: 'Job id of your async/job request'
}
```

#### Sync IODOpts
```javascript
var IODOpts = {
	majorVersion: IOD.VERSIONS.MAJOR.V1,
	action: IOD.ACTIONS.API.ANALYZESENTIMENT,
	apiVersion: IOD.VERSIONS.API.V1,
	method: 'get',
	params: {
		text: '=)'
	}
}
```

Finally you can make your request
```javascript
IOD.async(IODOpts, function(err, res) {
	console.log('ERROR: ', err)
	console.log('RES: ', res)
})

IOD.discovery(IODOpts, function(err, res) {
	console.log('ERROR: ', err)
	console.log('RES: ', res)
})

IOD.job(IODOpts, function(err, res) {
	console.log('ERROR: ', err)
	console.log('RES: ', res)
})

// And so on ...
```

# Constants

#### `ACTIONS` - List of all the different allowed actions

There are two types of actions:

1. `ACTIONS.DISCOVERY`
  * [`ACTIONS.DISCOVERY.API`](https://www.idolondemand.com/developer/docs/APIDiscovery.html)
2. `ACTIONS.API`
  * List of allowed actions and their aliases from [`API`](https://www.idolondemand.com/developer/docs/APIDiscovery.html).
  * (e.g. `ACTIONS.API.EXTRACTEXT`)
  
#### `TYPES` - List of all different request types

1. [`TYPES.ASYNC`](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm)
2. [`TYPES.SYNC`](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm)
3. [`TYPES.JOB`](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm)
4. [`TYPES.STATUS`](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm)
5. [`TYPES.RESULT`](https://www.idolondemand.com/developer/docs/AsynchronousAPI.htm)
6. [`TYPES.DISCOVERY`](https://www.idolondemand.com/developer/docs/APIDiscovery.html)

#### `VERSIONS` - List of all versions

There are two types of versions:

1. `VERSIONS.MAJOR` (eg. /`<majorVersion>`/api/sync/listindex/v1)
  * `VERSIONS.MAJOR.V1` - initial version
2. `VERSIONS.API`(eg. /1/api/sync/listindex/`<apiVersion>`)
  * `VERSIONS.API.V1` - initial version

## Methods

### async(IODOpts, callback)

Makes an async request to Idol on Demand with options specified from `IODOpts`.

* `IODOpts` - IOD options (see Async Schema)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from Idol on Demand as its second `res`.

### sync(IODOpts, callback)

Makes an sync request to Idol on Demand with options specified from `IODOpts`.

* `IODOpts` - IOD options (see Sync Schema)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from Idol on Demand as its second `res`.

### job(IODOpts, callback)

Makes a job request to Idol on Demand with options specified from `IODOpts`.

* `IODOpts` - IOD options (see Job Schema)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from Idol on Demand as its second `res`.

### status(IODOpts, callback)

Makes a status request to Idol on Demand with options specified from `IODOpts`.

* `IODOpts` - IOD options (see Status Schema)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from Idol on Demand as its second `res`.

### result(IODOpts, callback)

Makes a result request to Idol on Demand with options specified from `IODOpts`.

* `IODOpts` - IOD options (see Result Schema)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from Idol on Demand as its second `res`.

### discovery(IODOpts, callback)

Makes a discovery api request to Idol on Demand with options specified from `IODOpts`.

* `IODOpts` - IOD options (see Discovery Schema)
* `callback` - `Callback(err, res)` that accepts an error as its first argument `err` and the response from Idol on Demand as its second `res`.




 



