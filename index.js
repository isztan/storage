var localForage = require('localforage');
var asyncEach = require('async-each');
var type = require('component-type');

/**
 * Setup `localForage`.
 */

localForage.config({
  name: 'storage'
});

/**
 * Expose `storage`.
 */

module.exports = storage;

/**
 * Functional proxy to get/set/del methods.
 *
 * @param {String|Array|Object} key
 * @param {Mixed|Null} val
 * @param {Function} cb
 */

function storage(key, val, cb) {
  switch (arguments.length) {
    case 3: return val === null
      ? del(key, cb)
      : set(key, val, cb);
    case 2: return type(key) == 'object'
      ? set(key, val)
      : get(key, val);
    default:
      throw new TypeError('Not valid arguments length');
  }
}

/**
 * Expose methods.
 */

storage.forage = localForage;
storage.get = get;
storage.set = set;
storage.del = del;
storage.count = count;
storage.clear = clear;

/**
 * Get `key`.
 *
 * @param {Array|Mixed} key
 * @param {Function} cb
 */

function get(key, cb) {
  type(key) != 'array'
    ? localForage.getItem(key).then(wrapSuccess(cb, true), wrapError(cb))
    : asyncEach(key, get, function(err, res) {
        !err ? wrapSuccess(cb, true)(res) : wrapError(cb)(err);
      });
}

/**
 * Set `val` to `key`.
 *
 * @param {Array|Mixed} key
 * @param {Mixed} val
 * @param {Function} cb
 */

function set(key, val, cb) {
  type(key) != 'object'
    ? localForage.setItem(key, val).then(wrapSuccess(cb), wrapError(cb))
    : asyncEach(Object.keys(key), function(subkey, next) {
        set(subkey, key[subkey], next);
      }, val);
}

/**
 * Delete `key`.
 *
 * @param {Array|Mixed} key
 * @param {Function} cb
 */

function del(key, cb) {
  type(key) != 'array'
    ? localForage.removeItem(key).then(wrapSuccess(cb), wrapError(cb))
    : asyncEach(key, del, cb);
}

/**
 * Clear.
 *
 * @param {Function} cb
 */

function clear(cb) {
  localForage.clear().then(wrapSuccess(cb), wrapError(cb));
}

/**
 * Count records.
 *
 * @param {Functionc} cb
 */

function count(cb) {
  localForage.length().then(wrapSuccess(cb, true), wrapError(cb));
}

/**
 * Wrap promise style response to callback style.
 * If `cb` does not specified use console.log to display result.
 *
 * @param {Function} cb
 * @param {Boolean} [hasResult]
 * @return {Function}
 */

function wrapSuccess(cb, hasResult) {
  return function(res) {
    if (hasResult) type(cb) == 'function' ? cb(null, res) : console.log(res);
    else if (type(cb) == 'function') cb();
  };
}

/**
 * Wrap error callback, and throw err, when it's missing.
 *
 * @param {Function} cb
 * @return {Function}
 */

function wrapError(cb) {
  return function(err) {
    if (type(cb) == 'function') cb(err);
    else throw err;
  };
}
