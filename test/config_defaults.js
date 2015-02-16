/**
 * Default configuration parameters for unit test.
 */

'use strict';

module.exports = {
	/**
	 * Configuration parameters for utils.js
	 */

	// IOD apiKey
	apiKey: 'your api key',

	// Can override host, defaults to api.idolondemand.com
	host: null,
	// Can override port, defaults to 443
	port: null,

	// Timeout for unit test
	timeout: 300000,

	// Test connector name for connector tests
	testCon: 'testcon',
	// Test index name for textindexing tests
	testIndex: 'testindex',
	// Test store name for usermanagement tests
	testStore: 'teststore',
	// Test user name for usermanagement tests
	testUser: 'test@test.com',
	// Test role for usermanagement tests
	testRole: 'testrole',
	// Test password for usermanagement tests
	testPass: 'testpassword',
	// Test service name for prediction tests
	testServiceName: 'testservicename',

	/**
	 * Configuration parameters for request.js
	 */

	// List of request-type tests to include in test run
	includeReq: [],
	// List of request-type tests to exclude in test run
	excludeReq: [],
	// List of action tests to include in test run
	includeAct: ['analyzesentiment', 'api', 'viewdocument', 'connectors', 'extracttext'],
	/*
	 * List of action tests to exclude in test run.
	 * Quota for expandcontainer is 500, don't run unless we really have to
	 * Quota for recognizeimages is 1000, don't run unless we really have to
	 */
	excludeAct: ['expandcontainer', 'recognizeimages'],

	// Set to true to run only ActionSchemaTests
	actionSchemaOnly: false,

	/**
	 * Set to true to run simple tests only.
	 * This excludes `result` and `status` request-type tests.
	 * This only includes the for test in remaining request-type tests.
	 * This excludes test with IOD object via new instance.
	 */
	simpleTest: true
}