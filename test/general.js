/**
 * General unit thiss.
 */

'use strict';

var U = require('./utils')
var iod = require('../index')
var should = require('should')

var async = require('../lib/async-ext')
var apply = async.apply

describe('#GENERAL', function() {
	U.timeout(this)

	before(function(callback) {
		this.gen = {}
		var gen = this.gen

		async.waterfall([
			apply(U.createIOD, 0, gen),

			function invalidHost(done) {
				iod.create(gen.IOD.apiKey, 'http://blah', gen.IOD.port,
					U.beforeDoneFn(gen, 'host', done))
			},

			function invalidPort(done) {
				iod.create(gen.IOD.apiKey, gen.IOD.host, 1111,
					U.beforeDoneFn(gen, 'port', done))
			},

			function invalidApiKey(done) {
				iod.create('blah', gen.IOD.host, gen.IOD.port,
					U.beforeDoneFn(gen, 'apiKey', done))
			}
		], callback)
	})

	it('should throw when IOD apiKey is missing', function() {
		U.throwFunction(iod.create, null, 'blah', 'blah').should.throw()
	})

	it('should throw when IOD host is missing', function() {
		U.throwFunction(iod.create, 'blah', null, 'blah').should.throw()
	})

	it('should throw when IOD port is missing', function() {
		U.throwFunction(iod.create, 'blah', 'blah', null).should.throw()
	})

	it('should throw when host is missing protocol', function() {
		U.throwFunction(iod.create, 'blah', 'blah', 'blah').should.throw()
	})

	it('should error with invalid host', function() {
		U.shouldError(this.gen.host)
	})

	it('should error with invalid port', function() {
		U.shouldError(this.gen.port)
	})

	// Wait for fix
//	it('should error with invalid apiKey', function() {
//		console.log(this.gen.apiKey)
//		U.shouldError(this.gen.apiKey)
//	})
})