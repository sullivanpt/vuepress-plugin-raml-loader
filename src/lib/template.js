/**
 * Copyright (c) 2019 Patrick Sullivan
 * Licensed under the MIT license.
 */
'use strict'

const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const { promisify } = require('util') // https://stackoverflow.com/a/45463672
const readFile = promisify(fs.readFile)

/**
 * load and compile default lodash templates
 */
async function prepareDefaultTemplates() {
  // TODO: load these templates from options, and cache them
  // FUTURE: consider webpack addDependency for these
  const ramlTemplateParam = await readFile(
    path.resolve(__dirname, '../templates/template-en-param.md')
  )
  const ramlTemplateFormat = await readFile(
    path.resolve(__dirname, '../templates/template-en-format.md')
  )
  const ramlTemplate = await readFile(
    path.resolve(__dirname, '../templates/template-en-index.md')
  )
  const partials = {
    param: _.template(ramlTemplateParam),
    format: _.template(ramlTemplateFormat),
  }
  return _.template(ramlTemplate, { imports: { partials } })
}

/**
 * convert RAML as JSON to markdown using lodash templates
 * @param options.compiledTemplate return value from _.template fn
 * @returns markdown content from RAML input wrapped in a Promise
 */
exports.ramlTemplate = async function ramlTemplate(raml, options) {
  options = Object.assign({}, options)
  if (!options.compiledTemplate)
    options.compiledTemplate = await prepareDefaultTemplates()
  else if (typeof options.compiledTemplate === 'function')
    options.compiledTemplate = await options.compiledTemplate()
  return options.compiledTemplate({ raml })
}
