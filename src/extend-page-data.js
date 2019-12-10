/**
 * Adapted from https://github.com/vuejs/vuepress/blob/master/packages/%40vuepress/core/lib/node/Page.js
 *
 * Copyright (c) 2019 Patrick Sullivan
 * Licensed under the MIT license.
 */
'use strict'

const {
  inferTitle,
  extractHeaders,
  parseFrontmatter,
} = require('@vuepress/shared-utils')
const { ramlParseToTemplate } = require('./lib/parse-to-template')

/**
 * Copied from Page::process() when if (this._content && this._filePath.endsWith('.md'))
 * Assumes called with 'this' as $page
 */
function pageProcessMarkdown({ markdown }) {
  const { excerpt, data, content } = parseFrontmatter(this._content)
  this._strippedContent = content
  Object.assign(this.frontmatter, data)

  // infer title
  const title = inferTitle(this.frontmatter, this._strippedContent)
  if (title) {
    this.title = title
  }

  // extract headers
  const headers = extractHeaders(
    this._strippedContent,
    // FUTURE: why does the built-in default option gets lost when this plug in is used
    this._extractHeaders || ['h2', 'h3'],
    markdown
  )

  if (headers.length) {
    this.headers = headers
  }

  if (excerpt) {
    const { html } = markdown.render(excerpt, {
      frontmatter: this.frontmatter,
      relativePath: this.relativePath,
    })
    this.excerpt = html
  }
}

/**
 * removes '.raml' file suffix from web URLs
 */
function fixWebPaths($page) {
  // inspired by https://github.com/vuejs/vuepress/blob/master/packages/%40vuepress/shared-utils/src/fileToPath.ts
  //
  // Aside, linking to these gives a warning, see https://github.com/vuejs/vuepress/issues/1162
  $page.regularPath = $page.regularPath.replace(/\.raml\.html$/, '.html')
  $page.path = $page.regularPath
  $page.relativePath = $page.relativePath.replace(/\.raml$/, '')
}

module.exports = function(options, ctx) {
  return async function extendPageData($page) {
    if (!$page._filePath || !$page._filePath.endsWith('.raml')) return // not our page

    fixWebPaths($page)
    // note: we do a fatal stop on RAML parse error
    $page._content = await ramlParseToTemplate($page._filePath, {
      compiledTemplate: options.compiledTemplate,
      validate: true,
    })
    pageProcessMarkdown.call($page, ctx)
    // FUTURE: consider frontmatter for prev/next links to more raml
  }
}
