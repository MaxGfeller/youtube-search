var querystring = require('querystring')
var xhr = require('xhr')

// check if running in browser or as server
if (xhr.open) {
  xhr.open()
} else {
  console.error('xhr is not available in server mode')
  xhr = require('request')
}

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

module.exports = function (term, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  var params = {
    q: term,
    part: opts.part || 'snippet',
    maxResults: opts.maxResults || 30
  }

  Object.keys(opts).map(function (k) {
    if (allowedProperties.indexOf(k) > -1) params[k] = opts[k]
  })

  xhr({
    url: 'https://www.googleapis.com/youtube/v3/search?' + querystring.stringify(params),
    method: 'GET'
  }, function (err, res, body) {
    if (err) return cb(err)

    try {
      var result = JSON.parse(body)

      if (result.error) {
        var error = new Error(result.error.errors.shift().message)
        return cb(error)
      }

      var pageInfo = {
        totalResults: result.pageInfo.totalResults,
        resultsPerPage: result.pageInfo.resultsPerPage
      }

      var findings = result.items.map(function (item) {
        return {
          link: (item.id.kind === 'youtube#channel' ?
            'https://www.youtube.com/channel/' + item.id.channelId :
            'https://www.youtube.com/watch?v=' + item.id.videoId),
          kind: item.id.kind,
          publishedAt: item.snippet.publishedAt,
          channelId: item.snippet.channelId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnails: item.snippet.thumbnails
        }
      })

      return cb(null, findings, pageInfo)
    } catch(e) {
      return cb(e)
    }
  })
}
