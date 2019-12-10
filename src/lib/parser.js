/**
 * Copyright (c) 2019 Patrick Sullivan
 * Licensed under the MIT license.
 */
'use strict'

const path = require('path')
const raml = require('raml-1-parser') // old 0.8 version was var raml = require('raml-parser');
const jsyaml = require('raml-1-parser/dist/parser/jsyaml/jsyaml2lowLevel')

/**
 * raml parser library designed to be called from either webpack 4 or vuepress plugin
 * read a RAML file directly from the file system, including referenced sub-files, and reurn as a vanilla JSON object.
 * @param options.validate stop on RAML parser error
 * @param options.logger fn (fmt, ...) called to log each warning
 * @param options.addDependency fn (path) called to register additional loaded resource paths
 * @returns parsed RAML as JSON wrapped in a Promise
 */
exports.ramlParser = function ramlParser(resourcePath, options) {
  options = Object.assign(
    {
      addDependency() {},
      logger(...args) {
        console.warn(...args)
      },
      validate: false,
    },
    options
  )

  // Patch into getPendingFile to add dependencies when visited by the parser.
  // adapted from https://github.com/raml-org/raml-js-parser-2/blob/cdbdf925ae366b5d835cdb90d052ab1a879472c1/src/parser/test/longivityTestsUserTyping.ts
  const resolver = new jsyaml.FSResolverImpl()
  const fsResolver = {
    content: file => {
      // webpack addDependency needs fully resolved paths
      const resolved = path.resolve(file)
      options.addDependency(resolved)
      return resolver.content(resolved)
    },
    contentAsync: file => {
      const resolved = path.resolve(file)
      options.addDependency(resolved)
      return resolver.contentAsync(resolved)
    },
  }

  return raml.loadApi(resourcePath, { fsResolver }).then(function(data) {
    // parse instead of reload
    if (options.validate) {
      // stop on first validation error
      const firstError = data.errors().find(function(error) {
        return !error.isWarning
      })
      if (firstError) {
        throw new Error(
          data.RAMLVersion() +
            ' (' +
            firstError.path +
            ':' +
            firstError.range.start.line +
            ') ' +
            firstError.message
        )
      }
    }

    // show errors and warnings
    data.errors().forEach(function(error) {
      options.logger(
        (error.isWarning ? 'Warning ' : 'Error ') +
          data.RAMLVersion() +
          ' (' +
          error.path +
          ':' +
          error.range.start.line +
          ') ' +
          error.message
      )
    })

    // convert to legacy 'raml-parser' format
    data = data.toJSON({
      rootNodeDetails: false,
      serializeMetadata: false,
    })

    return data
  })
}
