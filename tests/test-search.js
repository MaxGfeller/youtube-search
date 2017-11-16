var search = require('../')
var test = require('tape')
var testblue = require('blue-tape')

var key = 'AIzaSyD1J1tnUlAxa0WxO9-XY6AwsuoBc7Dso1w'

test('basic', function (t) {
  search('deadmau5', {
    key: key
  }, function (err, results) {
    t.notOk(err, 'no error')
    t.equals(results.length, 30, '30 results')
    // results.map(function (r) { console.log(r.title + ': ' + r.link) })
    t.end()
  })
})

testblue('promise', function (t) {
  search('deadmau5', {
    key: key
  }).then(function (results) {
    t.equals(results.length, 30, '30 results')
    t.end()
  });
})
