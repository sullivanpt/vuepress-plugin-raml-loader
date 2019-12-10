/**
 * Copyright (c) 2019 Patrick Sullivan
 * Licensed under the MIT license.
 */
'use strict'

const { ramlParser } = require('./parser')
const { ramlPrerender } = require('./prerender')
const { ramlTemplate } = require('./template')

/**
 * read a RAML file and return it as a markdown formatted string wrapped in a promise
 */
exports.ramlParseToTemplate = async function ramlParseToTemplate(
  resourcePath,
  options
) {
  const parsed = await ramlParser(resourcePath, options)
  const prerendered = ramlPrerender(parsed, { resourcePath })
  // WARNING: in this path prerendered.jsonUrl is undefined as we only write to disk when using webpack
  const rendered = await ramlTemplate(prerendered, options)
  return rendered
}
