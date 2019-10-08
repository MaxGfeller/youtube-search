# youtube-search

[![build status](https://secure.travis-ci.org/MaxGfeller/youtube-search.png)](http://travis-ci.org/MaxGfeller/youtube-search)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Easily search for videos on Youtube using their v3 API.

## Options

You can pass a lot of optional parameters as the second parameter, they are
documented [here](https://developers.google.com/youtube/v3/docs/search/list).

## Rate limiting

Google enforces a rate limit on the Youtube Data API. You will probably need to
register your application for a key and supply this key in the `opts`.

## JavaScript Usage

```javascript
var search = require('youtube-search');

var opts = {
  maxResults: 10,
  key: 'yourkey',
};

search('jsconf', opts, function(err, results) {
  if(err) return console.log(err);

  console.dir(results);
});
```

You can also get some video metadata, like its `duration` or `statistics`, if you include the following properties in the opts:

```js
var opts = {
  key: 'yourkey',
  metadata: {
    duration: true,
    statistics: true
  }
};
```

or by fetching them manually for specific videos through a builder-like structure

```js
const search = require('youtube-search');

const videoIds = await search('jsconf', opts)

const metadata = search.metadata
  .includeDuration()
  .includeStatistics()
  .fetch(key, videoIds)
  .then((metadatas) => {
    metadatas.forEach(({ id, duration, statistics }) => {
      console.log(
        `Fetched metadata for id ${id}`,
        `duration: ${duration}`,
        `statistics ${JSON.stringify(statistics, null, 2)}`
      );
    })
  })
```

## TypeScript Usage

A TypeScript definition file is included so that 'youtube-search' can be used
easily from TypeScript.

```typescript
import * as youtubeSearch from "youtube-search";

var opts: youtubeSearch.search.YouTubeSearchOptions = {
  maxResults: 10,
  key: "yourkey"
};

youtubeSearch("jsconf", opts, (err, results) => {
  if(err) return console.log(err);

  console.dir(results);
});
```

## Tests

To run the tests you need a [Youtube v3 API key](https://console.developers.google.com/apis/credentials):

```bash
API_KEY=<your-api-key> npm test
```
