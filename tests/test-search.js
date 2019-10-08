var search = require('../')
var test = require('tape')

var key = process.env.API_KEY

test('basic', (t) => {
  search('jsconf', {
    key: key,
    metadata: {
      duration: true,
      statistics: true
    }
  }, function (err, results) {
    console.log(results)
    t.notOk(err, 'no error')
    t.equals(results.length, 30, '30 results')
    t.end()
  })
})

// test('basic with duration', (t) => {
//   search('jsconf', {
//     key,
//   })
// })

test('promise', (t) => {
  var p = search('jsconf', { key: key })
  t.ok(p)
  p.then((result) => {
    t.equals(result.results.length, 30, '30 results')
    t.end()
  })
})
