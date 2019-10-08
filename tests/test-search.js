var search = require('../')
var test = require('tape')

var key = process.env.API_KEY

test('basic', (t) => {
  search('jsconf', {
    key: key
  }, function (err, results) {
    t.notOk(err, 'no error')
    t.equals(results.length, 30, '30 results')
    t.end()
  })
})

test('basic with metadata', (t) => {
  search('jsconf', {
    key,
    metadata: {
      duration: true,
      statistics: true
    }
  }, function (err, results) {
    t.notOk(err, 'no error')
    var expectedArrayOfProps = ['viewCount', 'likeCount', 'dislikeCount', 'favoriteCount', 'commentCount']
    results.forEach((result) => {
      if (result.kind === 'youtube#video') {
        t.ok(result.duration, 'has duration')
        t.ok(result.statistics, 'a video has statistics')
        t.notStrictEqual(Object.keys(result.statistics), expectedArrayOfProps, 'has all statistics props')
      } else {
        t.notOk(result.duration, 'not a video, so no duration')
        t.notOk(result.statistics, 'not a video, so no statistics')
      }
    })
    t.end()
  })
})

test('promise', (t) => {
  var p = search('jsconf', { key: key })
  t.ok(p)
  p.then((result) => {
    t.equals(result.results.length, 30, '30 results')
    t.end()
  })
})

test('promise with metadata', (t) => {
  search('jsconf', {
    key,
    metadata: {
      duration: true,
      statistics: true
    }
  }).then(({ results }) => {
    var expectedArrayOfProps = ['viewCount', 'likeCount', 'dislikeCount', 'favoriteCount', 'commentCount']
    results.forEach((result) => {
      if (result.kind === 'youtube#video') {
        t.ok(result.duration, 'has duration')
        t.ok(result.statistics, 'a video has statistics')
        t.notStrictEqual(Object.keys(result.statistics), expectedArrayOfProps, 'has all statistics props')
      } else {
        t.notOk(result.duration, 'not a video, so no duration')
        t.notOk(result.statistics, 'not a video, so no statistics')
      }
    })
    t.end()
  })
})

test('metadata basic manually', (t) => {
  search('star butterfly and the forces of evil', { key: key }).then(({ results }) => {
    t.notOk(results.find(result => result.statistics || result.duration))
    const ids = results.map(item => item.id)

    search.metadata
      .includeDuration()
      .includeStatistics()
      .fetch(key, ids, function (error, metadataMap) {
        t.notOk(error, 'no error')
        Object.entries(metadataMap).forEach(([key, value]) => {
          t.ok(ids.includes(key))
          t.ok(value.duration)
          t.ok(value.statistics)
        })
        t.end()
      })
  })
})

test('metadata promise manually', (t) => {
  search('star butterfly and the forces of evil', { key: key }).then(({ results }) => {
    t.notOk(results.find(result => result.statistics || result.duration))
    const ids = results.map(item => item.id)

    search.metadata
      .includeDuration()
      .includeStatistics()
      .fetch(key, ids).then((metadatas) => {
        metadatas.forEach((metadata) => {
          t.ok(ids.includes(metadata.id))
          t.ok(metadata.duration)
          t.ok(metadata.statistics)
        })
        t.end()
      })
  })
})
