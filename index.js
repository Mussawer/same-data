module.exports = {
  sameData,
  isEmptyObject,
  shallowEqual,
  countDifferences
}

// Determines the type of the input value, handling special cases for various object types
function type (o) {
  if (o === null) return 'null' // Special case for null
  const t = typeof o // Get the basic type of the input
  if (t !== 'object') return t // Return the type if it's not an object
  if (Array.isArray(o)) return 'array' // Check if it's an array
  if (isTypedArray(o)) return (typeof o.equals === 'function') ? 'buffer' : 'array'
  if (o instanceof Set) return 'set' // Check for Set
  if (o instanceof Map) return 'map' // Check for Map
  return 'object' // Default case: it's a regular object
}

function isTypedArray (a) {
  return !!a && typeof a.length === 'number' && ArrayBuffer.isView(a.array)
}

function sameData (a, b) {
  if (a === b) return true

  const ta = type(a)
  const tb = type(b)

  if (ta !== tb) return false

  if (ta === 'buffer') return a.equals(b)

  if (ta === 'array') {
    if (a.length !== b.length) return false

    for (let i = 0; i < a.length; i++) {
      if (!sameData(a[i], b[i])) return false
    }

    return true
  }
  if (ta === 'set' || ta === 'map') return false // New types are not deeply compared
  if (ta !== 'object') return false

  const ea = Object.entries(a)
  const eb = Object.entries(b)

  if (ea.length !== eb.length) return false

  ea.sort(cmp)
  eb.sort(cmp)

  for (let i = 0; i < ea.length; i++) {
    if (ea[i][0] !== eb[i][0] || !sameData(ea[i][1], eb[i][1])) return false
  }

  return true
}

function cmp (a, b) {
  return a[0] === b[0] ? 0 : a[0] < b[0] ? -1 : 1
}

// Checks if an object is empty (has no own enumerable properties) and is not null or an array
function isEmptyObject (obj) {
  // Check for null, object type, not array, and no keys
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0
}

// Performs a shallow comparison of two objects, checking only the top-level properties
function shallowEqual (objA, objB) {
  // Quick check for identical objects
  if (objA === objB) return true
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    // Check if both are non-null objects
    return false
  }
  // Get keys of objA
  const keysA = Object.keys(objA)
  // Get keys of objB
  const keysB = Object.keys(objB)
  // Check if objects have same number of keys
  if (keysA.length !== keysB.length) return false
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || objA[key] !== objB[key]) {
      // Check if objB has the key and if values are the same
      return false
    }
  }
  // Objects are shallowly equal if all checks pass
  return true
}

// Counts the number of differences between two values, recursively checking nested structures
function countDifferences (a, b) {
  if (a === b) return 0 // No differences if values are identical
  const ta = type(a) // Get type of a
  const tb = type(b) // Get type of b
  if (ta !== tb) return 1 // Count as one difference if types are different
  if (ta === 'buffer' || ta === 'array') {
    let count = 0 // Initialize difference count
    if (a.length !== b.length) return 1 // Count as one difference if lengths are different
    for (let i = 0; i < a.length; i++) {
      count += countDifferences(a[i], b[i]) // Recursively count differences in array elements
    }
    return count // Return total count of differences
  }
  if (ta === 'set' || ta === 'map') return 1 // New types are considered different
  if (ta !== 'object') return 1 // Count as one difference if not an object at this point
  const ea = Object.entries(a) // Get entries of a
  const eb = Object.entries(b) // Get entries of b
  let count = 0 // Initialize difference count
  if (ea.length !== eb.length) count++ // Count as one difference if number of properties is different
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]) // Get all unique keys from both objects
  for (const key of allKeys) {
    if (!(key in a) || !(key in b)) {
      count++ // Count as one difference if key is missing in either object
    } else {
      count += countDifferences(a[key], b[key]) // Recursively count differences in property values
    }
  }
  return count // Return total count of differences
}
