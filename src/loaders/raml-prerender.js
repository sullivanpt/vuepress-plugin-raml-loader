/**
 * Copyright (c) 2019 Patrick Sullivan
 * Licensed under the MIT license.
 */
'use strict'

const { ramlPrerender } = require('../lib/prerender')

/*
 * Webpack 4 RAML as JSON transformer
 */
module.exports = function(data) {
  return ramlPrerender(data, {
    resourcePath: this.resourcePath,
  })
}
