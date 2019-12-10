/**
 * tweaked from grunt-raml-prerender. TODO: integrate unit tests
 * https://github.com/sullivanpt/grunt-raml-prerender
 *
 * Copyright (c) 2014-2019 Patrick Sullivan
 * Licensed under the MIT license.
 */
'use strict'

const _ = require('lodash')
const pd = require('pretty-data').pd // npm equivalent of vkiryukhin/vkBeautify
const yaml = require('js-yaml')
const omitDeep = require('omit-deep')

// helper to get rid of undesired properties like structuredExample, structuredValue, etc.
function omitUndesired(obj) {
  return omitDeep(obj, ['structuredExample', 'structuredValue'])
}

// helper to adding trait paged into resources queryParameters.
function updateResources(data) {
  var traitsPaged = _.get(
    _.find(data.traits || [], function(trt) {
      return trt.paged
    }),
    'paged.queryParameters'
  )
  if (traitsPaged) {
    _.forEach(data.resources || [], function(resource) {
      _.forEach(resource.methods || [], function(method) {
        if ((method.is || []).includes('paged')) {
          method.queryParameters = _.extend(
            method.queryParameters || {},
            traitsPaged
          )
        }
      })
    })
  }
  return data
}

// appropriate pretty printing
function beautify(format, data) {
  try {
    if (/xml/.test(format)) {
      return pd.xml(data)
    }
    if (/json/.test(format)) {
      return pd.json(data)
    }
    return data // unrecognized
  } catch (err) {
    return data // syntax error
  }
}

// parse schema string from JSON or YAML
function parseJsonSchema(schema) {
  // we use the presence of the double quoted string to differentiate JSON from YAML
  if (schema.indexOf('"$schema"') !== -1) {
    return JSON.parse(schema)
  } else {
    return yaml.safeLoad(schema)
  }
}

// helper to inherit properties from base classes. type is mutated. assumes base is deeply cloned
function inheritProperties(type, base, data) {
  if (!base) {
    return
  }
  if (base.properties) {
    if (!type.properties) {
      type.properties = base.properties
    } else {
      _.defaults(type.properties, base.properties) // inherit top level properties from base class, allow override
    }
  }
  inheritProperties(type, _.cloneDeep(data.types[base.type[0]]), data) // only support single inheritence
}

// helper to convert types
// if format is not null it is used to beautify examples
function convertType(type, format, data, converter) {
  var base, schema
  if (['JSON', 'XML'].indexOf(type.typePropertyKind) !== -1 && !type.schema) {
    type.schema = type.type // convert inline JSON and XML to RAML08 format
    delete type.type
  }
  if (type.typePropertyKind === 'TYPE_EXPRESSION') {
    // expand global types into each point of usage
    base = _.cloneDeep(data.types[type.type[0]]) // only support single inheritence
    inheritProperties(type, base, data)
    _.defaults(type, base)
    base = null
  }
  // TODO: consider supporting typePropertyKind 'INPLACE' (JSON in global type, object properties in type)
  if (type.properties) {
    convertProperties(type.properties, false, data, converter)
  }
  if (_.isArray(type.type)) {
    type.type = type.type.join(', ') // only support single inheritence, but show more types if present
  }
  if (type.items) {
    // type array will have an items field
    if (_.isArray(type.items)) {
      // if items is a type name or array of type names, normalize as a string
      type.items = type.items.join(', ') // only support single inheritence, but show more types if present
    }
    if (_.isString(type.items)) {
      // expand global types into each point of usage, converting items to in place type
      type.items = _.cloneDeep(data.types[type.items]) // only support single inheritence
      inheritProperties(type.items, type.items, data)
    }
    if (_.isObject(type.items)) {
      convertType(type.items, format, data, converter)
    }
  }
  if (type.description) {
    type.description = converter(type.description)
  }
  if (type.examples) {
    type.examples.forEach(function(example) {
      example.description =
        example.description && converter(example.description) // markdown for description
      example.value =
        (format && beautify(format, example.value)) || example.value
    })
  }
  if (type.example && format) {
    type.example = beautify(format, type.example)
  }
  if (type.schema && format) {
    if (format === 'application/json') {
      schema = parseJsonSchema(type.schema)
      if (schema.description && !type.description) {
        type.description = schema.description && converter(schema.description) // markdown for description
        delete schema.description // too much to see this twice
      }
      type.schema = JSON.stringify(schema)
    }
    type.schema = beautify(format, type.schema)
  }
}

// helper to convert type properties
function convertProperties(properties, isUri, data, converter) {
  _.forOwn(properties || {}, function(propertyValue, propertyKey) {
    if (isUri) {
      propertyValue.uri = true // so we can use same template
    }
    convertType(propertyValue, null, data, converter)
  })
}

// helper to convert a request or response body
function convertBodyFn(data, converter) {
  return function(formatValue, format) {
    // note: we assume body -> type -> example|schema, but body -> example|schema is also technically valid RAML
    convertType(formatValue, format, data, converter)
  }
}

// converts markdown, xml, and json to formatted html
function formatForDisplay(data, converter) {
  // convert global types to a map
  // but don't convertProperties them yet as that will happen when they get pulled in
  data.types = _.reduce(
    data.types,
    function(accumulator, value) {
      var key = _.keys(value)[0] // just keep the first one
      accumulator[key] = value[key]
      return accumulator
    },
    {}
  )

  convertProperties(data.baseUriParameters, true, data, converter)
  ;(data.documentation || []).forEach(function(doc) {
    doc.content = converter(doc.content)
  })
  ;(data.resources || []).forEach(function(resource) {
    resource.description =
      resource.description && converter(resource.description)
    convertProperties(resource.uriParameters, true, data, converter)
    ;(resource.methods || []).forEach(function(method) {
      method.description = method.description && converter(method.description)
      convertProperties(method.queryParameters, false, data, converter)

      _.forOwn(method.body || {}, convertBodyFn(data, converter))

      _.forOwn(method.responses || {}, function(response) {
        if (response) {
          response.description =
            response.description && converter(response.description)
          _.forOwn(response.body || {}, convertBodyFn(data, converter))
        }
      })
    })
  })

  // all types have been pulled inline
  delete data.types

  return data
}

// convert nested resources to rooted resources
function unnest(src, dst, path, uriParameters, description) {
  ;(src || []).forEach(function(resource) {
    delete resource.relativeUriPathSegments // not using it and it's no longer correct
    if (description) {
      resource.description =
        (resource.description ? resource.description + '<hr>' : '') +
        description
    }
    if (uriParameters) {
      resource.uriParameters = _.extend(
        resource.uriParameters || {},
        uriParameters
      )
    }
    resource.relativeUri = path + resource.relativeUri
    unnest(
      resource.resources,
      dst,
      resource.relativeUri,
      resource.uriParameters,
      resource.description
    )
    delete resource.resources
    dst.push(resource)
  })
  return dst
}

/**
 * raml transformer library designed to be called from either webpack 4 or vuepress plugin
 * rearranges structure so that it's easier to render using our templates
 * @param options.markdown If truthy custom markdown to HTML function fn(excerpt) => html
 *   for example new showdown.Converter().makeHtml
 * @param options.resourcePath Used for error reporting
 * @returns transformed RAML as JSON data
 */
exports.ramlPrerender = function ramlPrerender(data, options) {
  options = Object.assign(
    {
      // do not format markdown during the parsing stage
      markdown: s => s,
      srcPath: '#data',
    },
    options
  )

  // pre-process the data before we save it so there is less to do when we want to render it
  try {
    // TODO: error on unsupported features like: default mediaType
    data = omitUndesired(data)
    data.resources = unnest(data.resources, [], '')
    data = updateResources(data)
    data = formatForDisplay(data, options.markdown)
  } catch (err) {
    throw new Error('Error formatting ' + options.resourcePath + ' ' + err)
  }

  return data
}
