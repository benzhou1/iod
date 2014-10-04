/**
 * Unit test for IOD constants.
 */

'use strict';

var _ = require('lodash')
var U = require('./../utils')
var should = require('should')

describe('#CONSTANTS', function() {
	before(function(callback) {
		this.timeout(0)
		U.createIOD(0, this, callback)
	})

	it('#IOD.ACTIONS should be populated', function() {
		should.exists(this.IOD.ACTIONS)
		_.size(this.IOD.ACTIONS).should.not.eql(0)
	})

	it('#IOD.TYPES should be populated', function() {
		should.exists(this.IOD.TYPES)
		_.size(this.IOD.TYPES).should.not.eql(0)
	})

	it('#IOD.VERSIONS should be populated', function() {
		should.exists(this.IOD.VERSIONS)
		_.size(this.IOD.VERSIONS).should.not.eql(0)
	})
})

