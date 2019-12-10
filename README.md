# Vuepress plugin to parse RAML files and inject them as markdown
## vuepress-plugin-raml-loader

## Features

- reads *.raml 1.0 and 0.8 formatted files and referenced includes
- intermediate results are rendered as markdown enabling existing vuepress markdown related features
such as 'auto' search and sidenav menu generation on raml files
- raml can be mapped to arbitrary markdown using [lodash templates](https://lodash.com/docs/4.17.15#template)
- loaded raml content is represented as a simple JSON object and can be preprocessed for easier template rendering
- loaded raml content as JSON can be emitted as a resource file for consumption by other components such as an interactive API tool
- supports Webpack HMR when RAML file or its includes are edited in vuepress 'dev' mode
- Webpack loaders such as the parser and JSON template renderer can be used stand-alone if desired

## Getting Started

install the plugin

```
$ npm install --save-dev vuepress-plugin-raml-loader
```

add patterns and plugins to `.vuepress/config.js`

```
module.exports = {
  patterns: ['**/*.md', '**/*.vue', '**/*.raml'],
  plugins: [
    require('vuepress-plugin-raml-loader')
  ]
}
```

add *.raml files along side your *.md files

## Options

The default templates can be overridden by providing a function that returns
preloaded compiled templates as `compiledTemplate` wrapped in a Promise.
See `prepareDefaultTemplates()` in the source code for guidance.

## Caveats

- Only works with Vuepress config.js#patterns; it would be more clear if it
could add the raml as additionalPages (requires a Vuepress core change).
Furthermore it currently duplicates some code frjom vuepress/core.
- Uses the deprecated [raml-1-parser](https://github.com/raml-org/raml-js-parser-2) that
does not support OAS.
- markdown templates might be more intuitive if they were in Vue


