var search = require('../')
var test = require('tape')

var key = 'AIzaSyD1J1tnUlAxa0WxO9-XY6AwsuoBc7Dso1w'

test('basic', (t) => {
  search('jsconf', {
    key: key
  }, function (err, results) {
    t.notOk(err, 'no error')
    t.equals(results.length, 30, '30 results')
    t.end()
  })
})

test('promise', (t) => {
  var p = search('jsconf', { key: key })
  t.ok(p)
  p.then((result) => {
    t.equals(result.results.length, 30, '30 results')
    t.end()
  })
})
