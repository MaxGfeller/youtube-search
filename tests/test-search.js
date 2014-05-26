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
