/**
 * Unit test for async-ext utilities.
 */

'use strict';

var U = require('./../utils')
var should = require('should')
var async = require('../../lib/async-ext')

describe('#ASYNCEXT', function() {
	var fn = function(arg1, callback) {
		callback(null, arg1)
	}
	var failFn = function(arg1, callback) {
		callback(arg1)
	}

	describe('.doneFn', function() {
		before(function(callback) {
			this.df = {}
			var env = this.df

			async.waterfall([
				function one(done) {
					fn(1, async.doneFn(U.beforeDoneFn(env, 'one', done), function(arg1) {
						env.one = { arg: arg1 }
						return arg1 + 1
					}))
				},

				function two(done) {
					failFn(2, async.doneFn(U.beforeDoneFn(env, 'two', done), function(arg1) {
						env.two = { arg: arg1 }
						return arg1 + 1
					}))
				}
			], callback)
		})

		it('should have executed function and callback with returned value', function() {
			U.shouldBeSuccessful(this.df.one)
			this.df.one.response.should.be.eql(2)
			this.df.one.arg.should.be.eql(1)
		})

		it('should have executed callback right away on error', function() {
			U.shouldError(this.df.two)
			this.df.two.error.should.be.eql(2)
			should.not.exists(this.df.two.arg)
		})
	})

	describe('.split', function() {
		before(function(callback) {
			this.sp = {}
			var env = this.sp

			async.waterfall([
				function one(done) {
					fn(3, async.split(function(arg1) {
						env.one = { arg: arg1 }
						U.beforeDoneFn(env, 'one', done)(null, arg1)
					}, function(err) {
						U.beforeDoneFn(env, 'one', done)(err)
					}))
				},

				function two(done) {
					failFn(4, async.split(function(arg1) {
						env.two = { arg: arg1 }
						U.beforeDoneFn(env, 'two', done)(null, arg1)
					}, function(err) {
						env.two = { err: err }
						U.beforeDoneFn(env, 'two', done)(err)
					}))
				}
			], callback)
		})

		it('should have executed success callback', function() {
			U.shouldBeSuccessful(this.sp.one)
			this.sp.one.response.should.be.eql(3)
			this.sp.one.arg.should.be.eql(3)
		})

		it('should have executed error callback', function() {
			U.shouldError(this.sp.two)
			this.sp.two.err.should.be.eql(4)
			should.not.exists(this.sp.two.arg)
		})
	})

	describe('.noop', function() {
		before(function(callback) {
			async.waterfall([
				async.noop,

				function(done) {
					done(null, 123)
				},

				async.noop,

				function(done) {
					done(null, 123, 123)
				},

				async.noop
			], U.beforeDoneFn(this, 'np', callback))
		})

		it('should have successfully returned with no result', function() {
			should.not.exists(this.np.error)
			should.not.exists(this.np.response)
		})
	})

	describe('.constant', function() {
		before(function(callback) {
			this.co = {}
			var env = this.co

			async.waterfall([
				function(done) {
					done(null, 1)
				},

				async.constant
			], U.beforeDoneFn(env, 'one', callback))
		})

		it('should have passed argument as results', function() {
			U.shouldBeSuccessful(this.co.one)
			this.co.one.response.should.eql(1)
		})
	})

	describe('.when', function() {
		before(function(callback) {
			this.wh = {}
			var env = this.wh

			async.waterfall([
				async.when(true, function(done) {
					env.one = true
					done()
				}, function(done) {
					env.one = false
					done()
				}),

				async.when(false, function(done) {
					env.two = true
					done()
				}, function(done) {
					env.two = false
					done()
				}),

				async.when(false, function(done) {
					env.three = true
					done()
				})
			], callback)
		})

		it('on success check should execute left function', function() {
			this.wh.one.should.be.true
		})

		it('on fail check should execute right function', function() {
			this.wh.two.should.be.false
		})

		it('on fail check should default right to noop function', function() {
			should.not.exists(this.wh.three)
		})
	})

	describe('.fromFn', function() {
		before(function(callback) {
			this.ff = {}
			var env = this.ff

			async.waterfall([
				function(done) {
					done(null, 1)
				},

				async.fromFn(function(num) {
					return num+1
				}),

				function one(arg1, done) {
					env.one = {
						error: null,
						response: arg1
					}
					done(null, arg1, 2)
				},

				async.fromFn(function(num1, num2) {
					return num1 + num2
				})
			], U.beforeDoneFn(env, 'two', callback))
		})

		it('should have gotten returned results from function', function() {
			U.shouldBeSuccessful(this.ff.one)
			U.shouldBeSuccessful(this.ff.two)
			this.ff.one.response.should.be.eql(2)
			this.ff.two.response.should.be.eql(4)
		})
	})
})