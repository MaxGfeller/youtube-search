var search = require('../main.js');
var test = require('tap').test;

test('Make sure the search returns results', function(t) {
    search('deadmau5 ghosts n stuff', {
      maxResults: 5
    }, function(err, results) {
      t.notOk(err);
      t.ok(results);
      t.equals(5, results.length);
      t.end();
    });
});

test('Make sure errors get thrown', function(t) {
    search('whatever', {
        startIndex: 0
    }, function(err, results) {
        t.ok(err);
        t.end();
    });
});
