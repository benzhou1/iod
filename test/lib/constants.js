/**
 * Unit test for IOD constant values.
 */

'use strict';

var _ = require('lodash')
var U = require('../utils')
var should = require('should')
var iod = require('../../index')

describe('#IOD constants via create method', function() {
	U.timeout(this)

	before(function(callback) {
		var env = this

		U.createIOD(function(err, IOD) {
			env.IOD = IOD
			callback()
		})
	})

	it('should have existing constants', function() {
		should.exists(this.IOD.ACTIONS)
		should.exists(this.IOD.ACTIONS.API)
		should.exists(this.IOD.ACTIONS.API.QUERYTEXTINDEX)
		_.size(this.IOD.ACTIONS.API).should.not.be.eql(0)
		_.size(this.IOD.ACTIONS.DISCOVERY).should.not.be.eql(0)

		should.exists(this.IOD.TYPES)
		_.size(this.IOD.TYPES).should.not.be.eql(0)

		should.exists(this.IOD.VERSIONS)
		_.size(this.IOD.VERSIONS.MAJOR).should.not.be.eql(0)
		_.size(this.IOD.VERSIONS.API).should.not.be.eql(0)

		should.exists(this.IOD.schemas)
		should.exists(this.IOD.schemas.schema)
		_.size(this.IOD.schemas.schema).should.not.be.eql(0)
		should.exists(this.IOD.schemas.parameters)
		_.size(this.IOD.schemas.parameters).should.not.be.eql(0)
		should.exists(this.IOD.schemas.inputs)
		_.size(this.IOD.schemas.inputs).should.not.be.eql(0)
		should.exists(this.IOD.schemas.pairs )
		_.size(this.IOD.schemas.pairs ).should.not.be.eql(0)
	})
})

describe('#IOD constants via new instance', function() {
	it('should have existing constants', function() {
		var IOD = new iod('apikey')

		should.exists(IOD.ACTIONS)
		_.size(IOD.ACTIONS.DISCOVERY).should.not.be.eql(0)

		should.exists(IOD.TYPES)
		_.size(IOD.TYPES).should.not.be.eql(0)

		should.exists(IOD.VERSIONS)
		_.size(IOD.VERSIONS.MAJOR).should.not.be.eql(0)
		_.size(IOD.VERSIONS.API).should.not.be.eql(0)
	})

	it('should not have constants', function() {
		var IOD = new iod('apikey')

		should.not.exists(IOD.ACTIONS.API)
		should.not.exists(IOD.schemas.parameters)
		should.not.exists(IOD.schemas.inputs)
		should.not.exists(IOD.schemas.pairs )
	})

	it('should override values', function() {
		var IOD = new iod('apikey', 'http://host', 1111, { key: 'val' })
		var IOD1 = new iod('apikey', { key: 'val' })
		var IOD2 = new iod('apikey', 'http://host', { key: 'val' })

		IOD.apiKey.should.be.eql('apikey')
		IOD.host.should.be.eql('http://host')
		IOD.port.should.be.eql(1111)
		IOD.reqOpts.should.be.eql({ key: 'val', timeout: 300000 })

		IOD1.apiKey.should.be.eql('apikey')
		IOD1.reqOpts.should.be.eql({ key: 'val', timeout: 300000 })

		IOD2.apiKey.should.be.eql('apikey')
		IOD2.host.should.be.eql('http://host')
		IOD2.reqOpts.should.be.eql({ key: 'val', timeout: 300000 })
	})
})