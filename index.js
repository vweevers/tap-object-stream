var es = require('event-stream')
var introspect = require('introspect')
var pluckFactory = require('pluck')

module.exports = tap

function tap(rootName, mapper) {
  if (typeof rootName === 'function') {
    mapper = rootName
    rootName = null
  } else {
    var pluck = pluckFactory(rootName);
  }

  // Get function parameters names
  var names = introspect(mapper)
    , async = false

  if (names[names.length-1]==='done') {
    async = true
    names.length--
  }

  return es.map(function(obj, allDone){
    if (rootName) {
      var root = pluck(obj);
      if (root == null) root = obj[rootName] = {}
    } else {
      root = obj
    }

    var done = function() {
      var cb, val, name

      // Assign return values to properties
      for (var i = 0, l = arguments.length; i < l; i++) {
        val = arguments[i]

        if (typeof val === 'function') {
          cb = val; break
        }

        if (name = names[i]) root[name] = val
        else break
      }

      if (cb) cb(obj)
      allDone(null, obj)
    }

    // Dismiss object from stream unless b is truthy
    done.exclude = function(b, ifTruthy) {
      if (typeof b === 'function') {
        ifTruthy = b; b = true;
      } else if (typeof b === 'undefined') b = true
      
      if (b && ifTruthy) ifTruthy(obj)
      return b ? allDone() : done()
    }

    // Opposite of exclude
    done.include = function(b, ifTruthy) {
      if (typeof b === 'function') {
        ifTruthy = b; b = true;
      } else if (typeof b === 'undefined') b = true
      
      if (b && ifTruthy) ifTruthy(obj)
      return done.exclude(!b)
    }

    // Throw error unless b is truthy
    done.refute = function(b, ifTruthy) {
      if (typeof b === 'function') {
        ifTruthy = b; b = true;
      } else if (typeof b === 'undefined') b = true
      
      if (b && ifTruthy) ifTruthy(obj)
      return b ? allDone(new Error('tap-object-stream: refuted')) : done()
    }

    // Opposite of refute
    done.assert = function(b, ifTruthy) {
      if (typeof b === 'function') {
        ifTruthy = b; b = true;
      } else if (typeof b === 'undefined') b = true
      
      if (b && ifTruthy) ifTruthy(obj)
      return done.refute(!b)
    }

    var args = names.map(function(name){
      return root[name]
    })

    if (async) args.push(done)
    var ret = mapper.apply(null, args)
    if (!async) done(ret)
  })
}