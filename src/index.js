/**
 * Copyright (c) 2019 Patrick Sullivan
 * Licensed under the MIT license.
 */
'use strict'

const extendPageDataFactory = require('./extend-page-data')
const chainWebpackFactory = require('./chain-webpack')

/**
 * Vuepress plugin per https://vuepress.vuejs.org/plugin/writing-a-plugin.html
 * Long member functions extracted to separate files for readability
 *
 * plugin converts all RAML files in specified folder to vuepress content
 * FUTURE: dynamic folder scanning (for translated RAML in locales)
 *
 * We use a two pass template (we can't use vuepress vue within markdown templates
 * because title and headers get interpolated before vue renders):
 * - lodash template to convert raml to markdown
 * - then we feed generated markdown into vuepress
 */
module.exports = (options, ctx) => ({
  name: 'plugin-raml-webpack',
  // note additionalPages cannot add non md pages with _content
  // so we require config.js patterns: ['**/*.md', '**/*.vue', '**/*.raml'],
  extendPageData: extendPageDataFactory(options, ctx),
  chainWebpack: chainWebpackFactory(options, ctx),
})
