'use strict';

var child_process = require('child_process')

child_process.fork(
	'node_modules/istanbul/lib/cli.js',
	[
		'cover', '--print=summary', '--report=cobertura',
		'node_modules/mocha/bin/_mocha', '--recursive'
	]
)

child_process.exec('jshint lib examples test index.js', function(err, stdout, stderr) {
	console.log()
	console.log('Running JsHint:\n')
	console.log(stdout)
})