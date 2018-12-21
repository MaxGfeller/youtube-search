var querystring = require('querystring')
var axios = require('axios')
var duration = require('duration-iso-8601');

var allowedProperties = [
  'fields',
  'channelId',
  'channelType',
  'eventType',
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
]

module.exports = function search(term, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  if (!opts) opts = {}

  if (!cb) {
    return new Promise(function (resolve, reject) {
      search(term, opts, function (err, results, pageInfo) {
        if (err) return reject(err)
        resolve({ results: results, pageInfo: pageInfo })
      })
    })
  }

  var params = {
    q: term,
    part: opts.part || 'snippet',
    maxResults: opts.maxResults || 30
  }

  Object.keys(opts).map(function (k) {
    if (allowedProperties.indexOf(k) > -1) params[k] = opts[k]
  })
  if (!params.key)
    return cb("No key");
  axios.get('https://www.googleapis.com/youtube/v3/search?' + querystring.stringify(params))
    .then(function (response) {
      var result = response.data

      var pageInfo = {
        totalResults: result.pageInfo.totalResults,
        resultsPerPage: result.pageInfo.resultsPerPage,
        nextPageToken: result.nextPageToken,
        prevPageToken: result.prevPageToken
      }

      var findings = result.items.map(function (item) {
        var link = ''
        var id = ''
        switch (item.id.kind) {
          case 'youtube#channel':
            link = 'https://www.youtube.com/channel/' + item.id.channelId
            id = item.id.channelId
            break
          case 'youtube#playlist':
            link = 'https://www.youtube.com/playlist?list=' + item.id.playlistId
            id = item.id.playlistId
            break
          default:
            link = 'https://www.youtube.com/watch?v=' + item.id.videoId
            id = item.id.videoId
            break
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

      axios.get('https://www.googleapis.com/youtube/v3/videos?' + querystring.stringify({
        key: params.key,
        id: findings.map(f => f.id).join(','),
        part: 'contentDetails'
      }))
        .then(function (response) {
          process.stdout.write(JSON.stringify(response.data, null, 4));
          var findings2 = findings.map(function(item) {
            item.duration = duration(item.contentDetails.duration);
            return item;
          });
          return cb(null, findings2, pageInfo)
        })
        .catch(function (err) {
          return cb(err)
        })

    })
    .catch(function (err) {
      return cb(err)
    })
}
