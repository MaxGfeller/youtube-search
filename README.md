# youtube-search

[![build status](https://secure.travis-ci.org/MaxGfeller/youtube-search.png)](http://travis-ci.org/MaxGfeller/youtube-search)

Easily search for videos on Youtube using their v3 API.

## Usage

```javascript
var search = require('youtube-search');

var opts = {
  maxResults: 10,
  key: 'yourkey'
};

search('deadmau5', opts, function(err, results) {
  if(err) return console.log(err);

  console.dir(results);
});
```

You can pass a lot of optional parameters as the second parameter, they are
documented [here](https://developers.google.com/youtube/v3/docs/search/list?hl=de).

## Rate limiting

Google enforces a rate limit on the Youtube Data API. You will probably need to
register your application for a key and supply this key in the `opts`.
