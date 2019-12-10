/**
 * adapted from https://github.com/vuejs/vuepress/blob/master/packages/%40vuepress/core/lib/node/webpack/createBaseConfig.js
 *
 * Copyright (c) 2019 Patrick Sullivan
 * Licensed under the MIT license.
 */
'use strict'

module.exports = function(options, ctx) {
  return function chainWebpack(config, isServer) {
    // config is an instance of ChainableConfig

    const {
      siteConfig,
      sourceDir,
      base: publicPath,
      markdown,
      cacheDirectory,
      cacheIdentifier,
    } = ctx

    const extractHeaders =
      siteConfig.markdown && siteConfig.markdown.extractHeaders
    const finalCacheIdentifier = cacheIdentifier + `isServer:${isServer}`

    const ramlRule = config.module.rule('raml').test(/\.raml$/)

    ramlRule
      // see applyVuePipeline
      .use('vue-loader')
      .loader('vue-loader')
      .options({
        compilerOptions: {
          preserveWhitespace: true,
        },
        cacheDirectory,
        cacheIdentifier: finalCacheIdentifier,
      })
      .end()
      .use('markdown-loader')
      .loader(require.resolve('@vuepress/markdown-loader'))
      .options({ sourceDir, markdown, extractHeaders })
      .end()
      .use('raml-template')
      .loader(require.resolve('./loaders/raml-template.js'))
      .options({
        compiledTemplate: options.compiledTemplate,
      })
      .end()
      .use('emit-json-file')
      .loader(require.resolve('./loaders/emit-json-file.js'))
      .options({
        emitFile: !isServer,
        name: 'assets/raml/[name].[contenthash:8].json',
        // TODO: publicPath/postTransformPublicPath shouldn't be needed but are for json-url
        publicPath,
        postTransformPublicPath: s => JSON.parse(s),
      })
      .end()
      // see applyVuePipeline
      // must be before emitFile. https://github.com/webpack-contrib/cache-loader/issues/82
      .use('cache-loader')
      .loader('cache-loader')
      .options({
        cacheDirectory,
        cacheIdentifier: finalCacheIdentifier,
      })
      .end()
      .use('raml-prerender')
      .loader(require.resolve('./loaders/raml-prerender.js'))
      .end()
      .use('raml-parser')
      .loader(require.resolve('./loaders/raml-parser.js'))
      .options({
        // we've already validated with plugin load, so don't repeat that here
        validate: false,
      })
  }
}
