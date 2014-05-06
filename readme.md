# tap-object-stream

> Quickly tap into properties of streamed objects.

<!-- toc -->
* [Install](#install)
* [Examples](#examples)
  * [Single return value](#single-return-value)
  * [Multiple return values](#multiple-return-values)
  * [Go deep](#go-deep)
  * [Filter objects in a stream](#filter-objects-in-a-stream)
* [License](#license)

<!-- toc stop -->
## Install

    npm i tap-object-stream --save

## Examples

### Single return value

```js
var tap = require('tap-object-stream')

// By introspection, the function parameter 
// names are mapped to object properties
tap(function(count, add) {
  return count + add, 
})

.on('data', function(obj){
  console.log(obj.count) // 3
})

.write({ count: 1, add: 2 })
```

### Multiple return values

```js
// Add "done" as a parameter
tap(function(count, color, done) {
  done(3, 'blue')
})

.on('data', function(obj){
  console.log(obj.count, obj.color) // 3, 'blue'
})

.write({ count: 0, color: 'red' })
```

### Go deep

```js
// Properties don't have to exist beforehand
tap('files[0].data', function(name){
  return 'bob'
})

.on('data', function(obj){
  console.log(obj.files[0].data.name) // 'bob'
})

.write({ files: [{ data: {} }]})
```

### Filter objects in a stream

```js
var stream = tap(function(color, done) {
  done.exclude(color==='red')
})

// Will only output the blue and green objects
stream.on('data', console.log.bind(console))

stream.write({ color: 'blue' })
stream.write({ color: 'red' })
stream.write({ color: 'green' })
stream.end()
```

Available methods:

- `done.include()` or `done.exclude(false)`
- `done.include(false)` or `done.exclude()`

To emit an error and stop streaming, use:

- `done.assert()` or `done.refute(false)`
- `done.assert(false)` or `done.refute()`

## License

[MIT](http://opensource.org/licenses/MIT) © [Vincent Weevers](http://vincentweevers.nl)
