var querystring = require('querystring')
var axios = require('axios')
var convertYoutubeDuration = require('duration-iso-8601').convertYouTubeDuration

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

function MetadataHelper () {
  var metadataParts = []
  var helpers = {}

  return {
    withDuration: function () {
      if (metadataParts.indexOf('contentDetails') > -1) {
        metadataParts.push('contentDetails')
      }

      helpers.duration = function (metadata) {
        return convertYoutubeDuration(metadata.contentDetails.duration)
      }
      return this
    },
    withStatistics: function () {
      if (metadataParts.indexOf('statistics') > -1) {
        metadataParts.push('statistics')
      }

      helpers.statistics = function (metadata) {
        return metadata.statistics
      }
      return this
    },
    fetch: function (apiKey, videoIds) {
      if (!apiKey || !videoIds.length || !metadataParts.length) {
        return Promise.resolve({})
      }

      var parts = metadataParts.join(',')
      var resolvers = Object.assign({}, helpers)

      // resetting for the next use
      metadataParts = []
      helpers = {}

      return axios.get('https://www.googleapis.com/youtube/v3/videos?' + querystring.stringify({
        key: apiKey,
        id: (videoIds || []).join(','),
        part: parts.join(',')
      })).then((response) => {
        var metadataMap = response.data.items.reduce(function (allDetails, objectDetails) {
          // run objectDetails through each of the resolvers to get all the requested props
          var metadata = Object.keys(resolvers).reduce(function (results, propertyName) {
            var resolverFunction = resolvers[propertyName]
            return Object.assign(results, {
              [propertyName]: resolverFunction(objectDetails)
            })
          }, {})

          // merge them together by video id, creating a map of them for easier management later
          return Object.assign(allDetails, {
            [objectDetails.id]: metadata
          })
        }, {})

        return metadataMap
      })
    }
  }
}

var metadataHelper = new MetadataHelper()

module.exports = function search (term, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  if (!opts) opts = {}

  if (typeof cb !== 'function') {
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

  if (!params.key) {
    return cb(new Error('No key'))
  }

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

      if (opts.fetchDuration) {
        metadataHelper.withDuration()
      }

      if (opts.fetchStatistics) {
        metadataHelper.withStatistics()
      }

      metadataHelper.fetch(params.key, findings.map(f => f.id))
        .then(function (resultsMap) {
          var videosWithMetadata = findings.map(function (item) {
            const metadata = resultsMap[item.id]
            return metadata
              ? Object.assign(item, metadata)
              : item
          })
          return cb(null, videosWithMetadata, pageInfo)
        })
        .catch(function (err) {
          return cb(err)
        })
    })
    .catch(function (err) {
      return cb(err)
    })
}

module.exports.fetchMetadata = metadataHelper
