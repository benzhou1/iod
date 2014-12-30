/**
 * Unit test for transform utilities.
 */

'use strict';

var _ = require('lodash')
var U = require('./../utils')
var should = require('should')
var T = require('../../lib/transform')

describe('#TRANSFORM', function() {
	describe('.maplet', function() {
		it ('should have gotten singleton object', function() {
			T.maplet('string')('string').should.eql({ string: 'string' })
			T.maplet('array')([1, 2, 3]).should.eql({ array: [1, 2, 3] })
			T.maplet('boolean')(true).should.eql({ boolean: true })
			T.maplet('obj')({ key: 'va1' }).should.eql({ obj: { key: 'va1' } })
			T.maplet('number')(1).should.eql({ number: 1 })
		})
	})

	describe('.get', function() {
		var obj = {
			key1: 'val1',
			key2: 'val2',
			key3: 'val3'
		}

		it('should have gotten correct object values', function() {
			T.get('key1')(obj).should.be.eql('val1')
			T.get('key2')(obj).should.be.eql('val2')
			T.get('key3')(obj).should.be.eql('val3')
		})

		it('should throw error if property does not exists', function() {
			U.throwFunction(T.get('invalid key'), obj).should.throw()
		})
	})

	describe('.maybeToArray', function() {
		it('should be empty array', function() {
			T.maybeToArray(null).should.be.eql([])
			T.maybeToArray(undefined).should.be.eql([])
		})

		it('should be be same array', function() {
			var arr = [1, 2, 3]
			T.maybeToArray(arr).should.be.eql(arr)
		})

		it('should be a singleton array', function() {
			T.maybeToArray('string').should.be.eql(['string'])
			T.maybeToArray(1).should.be.eql([1])
			T.maybeToArray({}).should.be.eql([{}])
			T.maybeToArray(true).should.be.eql([true])
		})
	})

	describe('.maybeFromArray', function() {
		it('should be first element in array', function() {
			T.maybeFromArray(['blah']).should.be.eql('blah')
		})

		it('should be original value', function() {
			T.maybeFromArray([1, 2]).should.be.eql([1, 2])
			T.maybeFromArray('string').should.be.eql('string')
			T.maybeFromArray(1).should.be.eql(1)
			T.maybeFromArray(true).should.be.eql(true)
			T.maybeFromArray({}).should.be.eql({})
		})
	})

	describe('.compactObj', function() {
		it('should be compacted object', function() {
			var obj = {
				key1: 'val1',
				key2: null,
				key3: undefined,
				key4: 0
			}

			_.size(T.compactObj(obj)).should.be.eql(2)
		})

		it('should get back original value since not an object', function() {
			var arr = [1, null, undefined]

			should.not.exists(T.compactObj(null))
			T.compactObj(arr).should.be.eql(arr)
			T.compactObj('string').should.be.eql('string')
			T.compactObj(1).should.be.eql(1)
			T.compactObj(true).should.be.eql(true)
		})
	})

	describe('.toString', function() {
		it('should not of converted array to string', function() {
			T.toString(['a', 'b', 'c']).should.be.eql(['a', 'b', 'c'])
		})

		it('should of converted array elements to strings', function() {
			var obj = { key1: 'val1', key2: 'val2' }

			T.toString([true, obj, 1]).should.be.eql(['true', JSON.stringify(obj), '1'])
		})

		it('should return first element of array', function() {
			T.toString([true]).should.be.eql('true')
		})

		it('should be stringified object', function() {
			var obj = { key1: 'val1', key2: 'val2' }

			T.toString(obj).should.be.eql(JSON.stringify(obj))
		})

		it('should be a string', function() {
			T.toString('string').should.be.eql('string')
			T.toString(1).should.be.eql('1')
			T.toString(true).should.be.eql('true')
		})
	})

	describe('.attempt', function() {
		it('successfully attempted function should have correct return value', function() {
			var fn = function(a, b, c) {
				return a + b + c
			}

			T.attempt(fn, 'def')(1, 2, 3).should.be.eql(6)
		})

		it('should have returned default value on throw', function() {
			var fn = function() { throw 'error' }

			T.attempt(fn, 'def')().should.be.eql('def')
		})
	})

	describe('.try', function() {
		it('successfully tried function should have correct return value', function() {
			var fn = function(a) {
				return a + 1
			}

			T.try(fn)(3).should.be.eql(4)
		})

		it('should return original value passed to function', function() {
			var fn = function() { throw 'error' }

			T.try(fn)(3).should.be.eql(3)
		})
	})

	describe('.seq', function() {
		it('should have executed fns in sequence', function() {
			var fn = function(acc) {
				return acc + 1
			}

			T.seq([fn, fn, fn, fn])(0).should.be.eql(4)
		}),

		it('should not have mutated fns', function() {
			var fn = function(acc) {
				return acc + 1
			}
			var fn1 = function(acc) {
				return acc >= 3 ? 0 : (acc + 1)
			}
			var fns = [fn, fn, fn, fn1]

			T.seq(fns)(0).should.be.eql(0)
			T.seq(fns)(0).should.be.eql(0)
		})
	})

	describe('.asNumber', function() {
		it('should have converted to number', function() {
			T.asNumber(1).should.be.eql(1)
			T.asNumber('1').should.be.eql(1)
			T.asNumber('1.11').should.be.eql(1.11)
			T.asNumber('-1').should.be.eql(-1)
		})

		it('should throw if can\'t convert to number', function() {
			U.throwFunction(T.asNumber, {}).should.throw()
			U.throwFunction(T.asNumber, []).should.throw()
			U.throwFunction(T.asNumber, true).should.throw()
			U.throwFunction(T.asNumber, 'not a number').should.throw()
		})
	})

	describe('.asBoolean', function() {
		it('should have converted to boolean', function() {
			T.asBoolean(true).should.be.true
			T.asBoolean('true').should.be.true
			T.asBoolean('TrUe').should.be.true
			T.asBoolean(false).should.be.false
			T.asBoolean('false').should.be.false
			T.asBoolean('FaLsE').should.be.false
		})

		it('should throw if can\'t convert to boolean', function() {
			U.throwFunction(T.asBoolean, {}).should.throw()
			U.throwFunction(T.asBoolean, []).should.throw()
			U.throwFunction(T.asBoolean, 'not boolean').should.throw()
			U.throwFunction(T.asBoolean, 1).should.throw()
		})
	})

	describe('.walk', function() {
		it('should have walked object successfully', function() {
			var obj = {
				obj1: {
					obj2: {
						key: 'val'
					}
				}
			}

			T.walk(['obj1', 'obj2', 'key'])(obj).should.eql('val')
		})
	})
})