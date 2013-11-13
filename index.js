var parseString = require('xml2js').parseString;
var http = require('https');

var youtubeSearch = {}

youtubeSearch.search = function(q, opts, cb) {
  var baseUrl = 'https://gdata.youtube.com/feeds/api/videos?q=';
  var sanitizedQuery = q.replace(/ /g, '+');
  var optsString = '';

  for(var attr in opts) {
    switch(attr) {
      case 'maxResults': optsString += '&max-results=' + opts[attr];
                         break;
      case 'startIndex': optsString += '&start-index=' + opts[attr];
                         break;
      default: // don't do anything
    }
  }

  http.get(baseUrl + sanitizedQuery + optsString, function(res) {
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
