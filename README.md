# youtube-search

youtube-search is an npm module to easily search videos on youtube.

## Usage

`` javascript
var youtubeSearch = require('youtube-search');

youtubeSearch.search('deadmau5', function(err, results) {
  if(err) return console.log(err);

  console.dir(results);
});
```
