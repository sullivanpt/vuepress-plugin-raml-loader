/**
 * Adapted from https://github.com/webpack-contrib/file-loader/blob/master/src/index.js
 *
 * Copyright (c) 2019 Patrick Sullivan
 * Licensed under the MIT license.
 */
'use strict'

const path = require('path')
const loaderUtils = require('loader-utils')

/**
 * write the processed raml files as static JSON and
 * attach the site relative HTTP path to object as 'jsonUrl'
 *
 * See file-loader for equivalent usage options
 */
module.exports = function(rawContent) {
  const options = Object.assign({}, loaderUtils.getOptions(this))

  const content = JSON.stringify(rawContent)

  const context = options.context || this.rootContext
  const url = loaderUtils.interpolateName(
    this,
    options.name || '[contenthash].json',
    {
      context,
      content,
      regExp: options.regExp,
    }
  )

  let outputPath = url

  if (options.outputPath) {
    if (typeof options.outputPath === 'function') {
      outputPath = options.outputPath(url, this.resourcePath, context)
    } else {
      outputPath = path.posix.join(options.outputPath, url)
    }
  }

  let publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath)}`

  if (options.publicPath) {
    if (typeof options.publicPath === 'function') {
      publicPath = options.publicPath(url, this.resourcePath, context)
    } else {
      publicPath = `${
        options.publicPath.endsWith('/')
          ? options.publicPath
          : `${options.publicPath}/`
      }${url}`
    }

    publicPath = JSON.stringify(publicPath)
  }

  if (options.postTransformPublicPath) {
    publicPath = options.postTransformPublicPath(publicPath)
  }

  if (options.emitFile !== false) {
    this.emitFile(outputPath, content)
  }

  rawContent.jsonUrl = publicPath
  return rawContent
}
