# youtube-search

youtube-search is an npm module to easily search videos on youtube.

## Usage

```javascript 
var youtubeSearch = require('youtube-search');

var opts = {
  maxResults: 10,
  startIndex: 1
};

youtubeSearch.search('deadmau5', opts, function(err, results) {
  if(err) return console.log(err);

  console.dir(results);
});
```
