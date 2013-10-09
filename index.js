var parseString = require('xml2js').parseString;
var http = require('https');

var youtubeSearch = {}

youtubeSearch.search = function(q, cb) {
  var baseUrl = 'https://gdata.youtube.com/feeds/api/videos?q=';
  var sanitizedQuery = q.replace(/ /g, '+');

  http.get(baseUrl + sanitizedQuery, function(res) {
    var responseString = '';
    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      parseString(responseString, function(err, result) {
        if(err) cb(err);
        
        if(result.feed.entry) {
          cb(null, result.feed.entry.map(function(entry) {
            return {
              title: entry.title[0]._,
              url: entry.link[0].$.href
            };
          }));
        } else {
          cb('No results found'); 
        }
      });
    });
  }).on('error', function(e) {
    console.log('error occured');
    console.log(e);
  });
}

module.exports = youtubeSearch;
