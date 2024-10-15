const test = require('brittle')
const { sameData, isEmptyObject, shallowEqual, countDifferences } = require('./')

test('basic', function (t) {
  t.is(sameData(1, 1), true)
  t.is(sameData(1, 2), false)
  t.is(sameData(), true) // undef undef
  t.is(sameData(true, true), true)
  t.is(sameData('true', true), false)
  t.is(sameData('true', 'true'), true)
})

test('objects', function (t) {
  t.is(sameData({ foo: 1 }, { foo: 1 }), true)
  t.is(sameData({ foo: 1 }, { foo: 1, bar: true }), false)
  t.is(sameData({ foo: 1, nested: { a: 1 } }, { foo: 1, nested: { a: 1 } }), true)
  t.is(sameData([{ a: 1 }, { b: 1 }], [{ a: 1 }, { b: 1 }]), true)
})

test('typed arrays', function (t) {
  t.is(sameData(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3])), true)
  t.is(sameData(new Uint8Array([1, 2, 1]), new Uint8Array([1, 2, 3])), false)
})

test('buffers', function (t) {
  t.is(sameData(Buffer.from([1, 2, 3]), Buffer.from([1, 2, 3])), true)
  t.is(sameData(Buffer.from([1, 2, 1]), Buffer.from([1, 2, 3])), false)
})

// Test if the isEmptyObject function correctly identifies empty objects and non-objects
test('isEmptyObject', function (t) {
  t.is(isEmptyObject({}), true)
  t.is(isEmptyObject({ a: 1 }), false)
  t.is(isEmptyObject([]), false)
  t.is(isEmptyObject(null), false)
  t.is(isEmptyObject(undefined), false)
})

// Test if shallowEqual correctly compares objects with simple values
test('shallowEqual', function (t) {
  t.is(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 }), true)
  t.is(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 3 }), false)
  t.is(shallowEqual({ a: 1 }, { a: 1, b: 2, c: { a: 1, b: 2 } }), false)
})

// Test if countDifferences accurately counts differences between objects
test('countDifferences', function (t) {
  t.is(countDifferences({ a: 1, b: 2 }, { a: 1, b: 2 }), 0)
  t.is(countDifferences({ a: 1, b: 2 }, { a: 1, b: 3 }), 1)
  t.is(countDifferences({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 3 } }), 1)
  t.is(countDifferences({ a: 1, b: 2, c: 3 }, { a: 1, b: 3, d: 4 }), 3)
})

// Test if sameData correctly handles new types (Set, Map) by returning false
test('sameData with new types', function (t) {
  t.is(sameData(new Set([1, 2, 3]), new Set([1, 2, 3])), false)
  t.is(sameData(new Map([['a', 1], ['b', 2]]), new Map([['a', 1], ['b', 2]])), false)
})
