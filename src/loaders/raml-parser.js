/**
 * Adapted from https://github.com/opensourcecu/raml-loader/blob/master/index.js
 *
 * Copyright (c) 2019 Patrick Sullivan
 * Licensed under the MIT license.
 */
'use strict'

const { getOptions } = require('loader-utils')
const { ramlParser } = require('../lib/parser')

/**
 * Webpack 4 loader to read a RAML file directly from the file system, including referenced sub-files,
 *  and pass it through as a vanilla JSON object.
 *
 * options {
 *   validate - stop on raml parser error
 * }
 */
module.exports = function(content) {
  // TODO: doesn't seem to log anything, probably some vuepress madness
  const logger = this.getLogger()

  const options = Object.assign({}, getOptions(this))
  const cb = this.async()

  ramlParser(this.resourcePath, {
    // FUTURE: pass preloaded content to raml parse instead of reloading
    validate: options.validate, // TODO: set this true in production mode else false
    addDependency: file => this.addDependency(file),
    logger: (...args) => {
      logger.warn(...args)
    },
  })
    .then(data => cb(null, data))
    .catch(err => cb(err))
}
