'use strict';

var child_process = require('child_process')

child_process.fork(
	'node_modules/istanbul/lib/cli.js',
	[
		'cover', '--print=summary', '--report=cobertura',
		'node_modules/mocha/bin/_mocha', '--recursive', 'test/lib/*.js',
		'node_modules/mocha/bin/_mocha', '--recursive', 'test/*js'
	]
)

child_process.exec(
	[
		'jshint',
		'lib/async-ext', 'lib/constants.js', 'lib/iod.js', 'lib/schema.js', 'lib/send.js',
		'lib/transform.js',
		'examples',
		'test',
		'index.js'
	].join(' '),
	function(err, stdout, stderr) {
	console.log()
	console.log('Running JsHint:\n')
	console.log(stdout)
})