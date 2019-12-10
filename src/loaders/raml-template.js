/**
 * Copyright (c) 2019 Patrick Sullivan
 * Licensed under the MIT license.
 */
'use strict'

const { getOptions } = require('loader-utils')
const { ramlTemplate } = require('../lib/template')

/**
 * Webpack 4 convert RAML as JSON to markdown using lodash templates
 */
module.exports = function(raml) {
  const cb = this.async()
  const options = Object.assign({}, getOptions(this))

  ramlTemplate(raml, {
    compiledTemplate: options.compiledTemplate,
  })
    .then(content => cb(null, content))
    .catch(err => cb(err))
}
