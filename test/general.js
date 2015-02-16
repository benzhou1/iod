/**
 * General unit tests.
 */

'use strict';

var U = require('./utils')
var iod = require('../index')
var should = require('should')
var async = require('../lib/async-ext')

describe('#GENERAL', function() {
	this.timeout(60000)

	before(function(callback) {
		this.gen = {}
		var gen = this.gen

		U.createIOD(function(err, IOD) {
			async.waterfall([
				function withDefHostPort(done) {
					iod.create(IOD.apiKey, U.beforeDoneFn(gen, 'defhostdefport', done))
				},

				function withDefHostHttpPort(done) {
					iod.create(IOD.apiKey, null, 80,
						U.beforeDoneFn(gen, 'defhosthttpport', done))
				},

				function withDefHostHttpsPort(done) {
					iod.create(IOD.apiKey, null, 443,
						U.beforeDoneFn(gen, 'defhosthttpsport', done))
				},

				function withHttpHostDefPort(done) {
					iod.create(IOD.apiKey, 'http://api.idolondemand.com', null,
						U.beforeDoneFn(gen, 'httphostdefport', done))
				},

				function withHttpsHostDefPort(done) {
					iod.create(IOD.apiKey, 'https://api.idolondemand.com', null,
						U.beforeDoneFn(gen, 'httpshostdefport', done))
				},

				function invalidHost(done) {
					iod.create(IOD.apiKey, 'http://blah',
						U.beforeDoneFn(gen, 'host', done))
				},

				function invalidPort(done) {
					iod.create(IOD.apiKey, IOD.host, 1111,
						U.beforeDoneFn(gen, 'port', done))
				},

				function invalidApiKey(done) {
					iod.create('blah', IOD.host, IOD.port,
						U.beforeDoneFn(gen, 'apiKey', done))
				}
			], callback)
		})
	})

	it('should throw when IOD apiKey is missing', function() {
		U.throwFunction(iod.create, null, 'blah', 'blah').should.throw()
	})

	it('should throw when host is missing protocol', function() {
		U.throwFunction(iod.create, 'blah', 'blah', 'blah').should.throw()
	})

	it('should be default values with no host and no port', function() {
		U.shouldBeSuccessful(this.gen.defhostdefport)
		this.gen.defhostdefport.response.host.should.eql('https://api.idolondemand.com')
		this.gen.defhostdefport.response.port.should.eql(443)
	})

	it('default host should be http because of port', function() {
		U.shouldBeSuccessful(this.gen.defhosthttpport)
		this.gen.defhosthttpport.response.host.should.eql('http://api.idolondemand.com')
		this.gen.defhosthttpport.response.port.should.eql(80)
	})

	it('default host should be https because of port', function() {
		U.shouldBeSuccessful(this.gen.defhosthttpsport)
		this.gen.defhosthttpsport.response.host.should.eql('https://api.idolondemand.com')
		this.gen.defhosthttpsport.response.port.should.eql(443)
	})

	it('default port should be http because of host', function() {
		U.shouldBeSuccessful(this.gen.httphostdefport)
		this.gen.httphostdefport.response.host.should.eql('http://api.idolondemand.com')
		this.gen.httphostdefport.response.port.should.eql(80)
	})

	it('default port should be https because of host', function() {
		U.shouldBeSuccessful(this.gen.httpshostdefport)
		this.gen.httpshostdefport.response.host.should.eql('https://api.idolondemand.com')
		this.gen.httpshostdefport.response.port.should.eql(443)
	})

	it('should error with invalid host', function() {
		U.shouldError(this.gen.host)
	})

	it('should error with invalid port', function() {
		U.shouldError(this.gen.port)
	})

	it('should error with invalid apiKey', function() {
		U.shouldError(this.gen.apiKey)
	})
})