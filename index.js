let querystring = require('querystring');
let axios = require('axios');

let allowedProperties = [
  'fields',
  'channelId',
  'channelType',
  'eventType',
  'chart',
  'forContentOwner',
  'forDeveloper',
  'forMine',
  'location',
  'locationRadius',
  'onBehalfOfContentOwner',
  'order',
  'pageToken',
  'publishedAfter',
  'publishedBefore',
  'regionCode',
  'relatedToVideoId',
  'relevanceLanguage',
  'safeSearch',
  'topicId',
  'type',
  'videoCaption',
  'videoCategoryId',
  'videoDefinition',
  'videoDimension',
  'videoDuration',
  'videoEmbeddable',
  'videoLicense',
  'videoSyndicated',
  'videoType',
  'key'
];

module.exports = function search (term, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  if (!opts) opts = {};

  if (!cb) {
    return new Promise(function (resolve, reject) {
      search(term, opts, function (err, results, pageInfo) {
        if (err) return reject(err);
        resolve({results: results, pageInfo: pageInfo})
      })
    })
  }

  let params = {
    q: term,
    part: opts.part || 'snippet',
    maxResults: opts.maxResults || 30,
    locationType: opts.locationType || "search"
  };

  Object.keys(opts).map(function (k) {
    if (allowedProperties.indexOf(k) > -1) params[k] = opts[k]
  });

  console.log("https://www.googleapis.com/youtube/v3/" + params.locationType + "?" + querystring.stringify(params));
  axios.get("https://www.googleapis.com/youtube/v3/" + params.locationType + "?" + querystring.stringify(params))
    .then(function (response) {
      let result = response.data;

      let pageInfo = {
        totalResults: result.pageInfo.totalResults,
        resultsPerPage: result.pageInfo.resultsPerPage,
        nextPageToken: result.nextPageToken,
        prevPageToken: result.prevPageToken
      };

      let findings = result.items.map(function (item) {
        let link = '';
        let id = '';
        switch (item.id.kind) {
          case 'youtube#channel':
            link = 'https://www.youtube.com/channel/' + item.id.channelId;
            id = item.id.channelId;
            break;
          case 'youtube#playlist':
            link = 'https://www.youtube.com/playlist?list=' + item.id.playlistId;
            id = item.id.playlistId;
            break;
          default:
            link = 'https://www.youtube.com/watch?v=' + item.id.videoId;
            id = item.id.videoId;
            break;
        }

        return {
          id: id,
          link: link,
          kind: item.id.kind,
          publishedAt: item.snippet.publishedAt,
          channelId: item.snippet.channelId,
          channelTitle: item.snippet.channelTitle,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnails: item.snippet.thumbnails
        }
      })

      return cb(null, findings, pageInfo)
    })
    .catch(function (err) {
      return cb(err)
    })
};
