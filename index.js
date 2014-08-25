var parseString = require('xml2js').parseString;
var http = require('http');

youtubeSearch = function(useCorsProxy, q, opts, cb) {
  var sanitizedQuery = encodeURI(q);
  var optsString = '';

  for(var attr in opts) {
    switch(attr) {
      case 'maxResults': optsString += '&max-results=' + opts[attr]; break;
      case 'startIndex': optsString += '&start-index=' + opts[attr]; break;
      case 'category': optsString += '&category=' + opts[attr]; break;
    }
  }

  var host = 'gdata.youtube.com';
  var path = '/feeds/api/videos?q=';

  if(useCorsProxy === true) {
      path = '/' + host + path;
      host = 'www.corsproxy.com';
  }

  http.get({
    host: host,
    path: path + sanitizedQuery + optsString,
    scheme: 'http',
    withCredentials: false,
    headers: {
      'Access-Control-Allow-Credentials': 'false'
    }
  }, function(res) {
    var responseString = '';
    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      parseString(responseString, function(err, result) {
        var entries = result && result.feed && result.feed.entry || [];

        cb(err, entries.map(function(entry) {
          return {
            title: entry.title[0]._,
            url: entry.link[0].$.href,
            category: entry.category[1].$.term,
            description: entry.content[0]._,
            duration: entry["media:group"][0]["yt:duration"][0].$.seconds,
            author: entry.author[0].name[0],
            thumbnails: entry["media:group"][0]["media:thumbnail"].map(function (size) {
              return size.$;
            }),
            statistics: entry["yt:statistics"] ? entry["yt:statistics"][0].$ : {},
            published: entry.published[0],
            updated: entry.updated[0]
          };
        }));
      });
    });
  }).on('error', cb);
}

module.exports = youtubeSearch;
