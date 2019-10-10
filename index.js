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
  var extractors = {
    id: function (metadata) {
      return metadata.id
    }
  }

  var reset = function () {
    metadataParts = []
    extractors = {
      id: function (metadata) {
        return metadata.id
      }
    }
  }

  return {
    includeDuration: function () {
      if (metadataParts.indexOf('contentDetails') === -1) {
        metadataParts.push('contentDetails')
      }

      extractors.duration = function (metadata) {
        return convertYoutubeDuration(metadata.contentDetails.duration)
      }

      return this
    },
    includeStatistics: function () {
      if (metadataParts.indexOf('statistics') === -1) {
        metadataParts.push('statistics')
      }

      extractors.statistics = function (metadata) {
        return metadata.statistics
      }

      return this
    },
    fetch: function (apiKey, videoIds, cb) {
      var self = this
      if (typeof cb !== 'function') {
        return new Promise(function (resolve, reject) {
          self.fetch(apiKey, videoIds, function (error, metadata) {
            if (error) reject(error)
            resolve(metadata)
          })
        })
      }

      if (!apiKey || !videoIds.length || !metadataParts.length) {
        return cb(null, [])
      }

      var parts = metadataParts.join(',')
      var extractorFunctions = extractors

      reset()

      axios.get('https://www.googleapis.com/youtube/v3/videos?' + querystring.stringify({
        key: apiKey,
        id: (videoIds || []).join(','),
        part: parts
      })).then(function (response) {
        var metadata = response.data.items.map(function (details) {
          // run objectDetails through each of the resolvers to get all the requested props
          return Object.keys(extractorFunctions).reduce(function (allMetadata, property) {
            var extractPropertyValue = extractorFunctions[property]
            return Object.assign(allMetadata, {
              [property]: extractPropertyValue(details)
            })
          }, {})
        })

        cb(null, metadata)
      }).catch(function (error) {
        cb(error)
      })
    }
  }
}

module.exports = function search (term, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  if (!opts) opts = {}

  if (!opts.metadata) {
    Object.assign(opts, { metadata: {} })
  }

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

      var metadataHelper = new MetadataHelper()

      if (opts.metadata.duration) {
        metadataHelper.includeDuration()
      }

      if (opts.metadata.statistics) {
        metadataHelper.includeStatistics()
      }

      metadataHelper.fetch(params.key, findings.map(f => f.id))
        .then(function (metadatas) {
          // create a map of { id: metadata } to avoid traversing through the array on each loop iteration to find
          // the correct video by id in the metadata array
          var metadataMap = metadatas.reduce(function (allMetadata, metadata) {
            var id = metadata.id
            delete metadata.id
            return Object.assign(allMetadata, {
              [id]: metadata
            })
          }, {})

          var videosWithMetadata = findings.map(function (item) {
            const metadata = metadataMap[item.id]
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

var metadataHelper = new MetadataHelper()

module.exports.metadata = metadataHelper
