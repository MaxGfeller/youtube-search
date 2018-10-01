const axios = require('axios')

const DEFAULT_CONFIG = {
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  params: {},
  data: {}
}

class RestClient {
  constructor (config = {}) {
    this.config = Object.assign({}, DEFAULT_CONFIG, config)
  }

  executeRequest (url, config) {
    const finalConfig = Object.assign({}, { DEFAULT_CONFIG }, { url, ...config })

    return axios
      .request(finalConfig)
      .then(response => Promise.resolve(response.data))
      .catch(errorResponse => {
        const error = errorResponse.response.data
        return Promise.reject(new Error(error))
      })
  }

  get (url, params = {}, config) {
    return this.executeRequest(url, { ...config, params })
  }
}

module.exports = RestClient
