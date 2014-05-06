var test = require('tap').test
var gutil = require('gulp-util')
var tap = require('./')

test("empty object", function(t) {
  var stream = tap(function(name) {
    return 'bob'
  })

  stream.on('data', function(obj){
    t.equal(obj.name, 'bob')
    t.end()
  })
	
  stream.write({})
})

test("file", function(t) {
  var stream = tap(function(contents) {
    return Buffer.concat([contents, new Buffer(' world')])
  })

  stream.on('data', function(file){
    t.equal(file.contents.toString(), 'hello world')
    t.end()
  })

  stream.write(new gutil.File({
    contents: new Buffer('hello')
  }))
})

test("pluck", function(t) {
  var stream = tap('this.is[0].nested', function(deep) {
    return 'very'
  })

  stream.on('data', function(obj){
    t.equal(obj.this.is[0].nested.deep, 'very')
    t.end()
  })
  
  stream.write({
    this: {
      is: [{
        nested: {}
      }]
    }
  })
})

test("multiple properties", function(t) {
  var stream = tap('metadata', function(title, count, done) {
    done('sundown', ++count)
  })

  stream.on('data', function(obj){
    t.equal(obj.metadata.title, 'sundown')
    t.equal(obj.metadata.count, 24)
    t.end()
  })
  
  stream.write({
    metadata: {
      title: 'sunrise',
      count: 23
    }
  })
})

test("exclude", function(t) {
  var stream = tap(function(color, done) {
    done.exclude(color==='red')
  })

  var count = 0
  stream.on('data', function(){ count++ })

  stream.on('end', function(){
    t.equal(count, 2)
    t.end()
  })
  
  stream.write({ color: 'blue' })
  stream.write({ color: 'red' })
  stream.write({ color: 'green' })
  stream.end()
})

test("exclude all", function(t) {
  var stream = tap(function(color, done) {
    done.exclude()
  })

  var count = 0
  stream.on('data', function(){ count++ })

  stream.on('end', function(){
    t.equal(count, 0)
    t.end()
  })
  
  stream.write({ color: 'blue' })
  stream.write({ color: 'red' })
  stream.write({ color: 'green' })
  stream.end()
})

test("include", function(t) {
  var stream = tap(function(color, done) {
    done.include(color==='red')
  })

  var count = 0
  stream.on('data', function(){ count++ })

  stream.on('end', function(){
    t.equal(count, 1)
    t.end()
  })
  
  stream.write({ color: 'blue' })
  stream.write({ color: 'red' })
  stream.write({ color: 'green' })
  stream.end()
})

test("refute", function(t) {
  var stream = tap(function(color, done) {
    done.refute(color==='red')
  })

  var count = 0
  stream.on('data', function(){ count++ })

  stream.on('error', function(){
    t.equal(count, 1)
    t.end()
  });
  
  stream.write({ color: 'blue' })
  stream.write({ color: 'red' })
  stream.write({ color: 'green' })
  stream.end()
})

test("negative refute", function(t) {
  var stream = tap(function(color, done) {
    done.refute(false)
  })

  var count = 0
  stream.on('data', function(){ count++ })

  stream.on('end', function(){
    t.equal(count, 3)
    t.end()
  })
  
  stream.write({ color: 'blue' })
  stream.write({ color: 'red' })
  stream.write({ color: 'green' })
  stream.end()
})

test("exclude with callback", function(t) {
  var will = { personal: { age: 24, name: 'will' }}
    , marg = { personal: { age: 42, name: 'margaret' }};

  var stream = tap('personal', function(age, done) {
    done.exclude(age<30, function(person){
      person.excluded = true
    })
  })

  stream.on('end', function(){ 
    t.ok(will.excluded)
    t.end()
  })

  stream.write(will)
  stream.write(marg)
  stream.end()
})

test("done with callback", function(t) {
  var obj1 = {}, obj2 = {};

  var stream = tap('personal', function(done) {
    done(function(obj){ obj.tapped = true })
  })

  stream.on('end', function(){ 
    t.ok(obj1.tapped)
    t.ok(obj2.tapped)
    t.end()
  })

  stream.write(obj1)
  stream.write(obj2)
  stream.end()
})

test("no properties", function(t) {
  var stream = tap(function(done) {
    done()
  })

  var count = 0
  stream.on('data', function(){ count++ })

  stream.on('end', function(){
    t.equal(count, 3)
    t.end()
  })
  
  stream.write({})
  stream.write({})
  stream.write({})
  stream.end()
})