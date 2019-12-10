# <%= raml.title %>

<% /* comment: this is lodash template for markdown https://lodash.com/docs/4.17.11#template */ %>

<% if (raml.documentation) { %>

## Overview

  <% _.forEach(raml.documentation, doc => { %>

### <%= doc.title %>

<%= doc.content %>

  <% }) %>
<% } %>

## Methods

<% _.forEach(raml.resources, ramlResource => { %>
  <% _.forEach(ramlResource.methods, ramlMethod => { %>

### <%= ramlMethod.displayName ? ramlMethod.displayName : (ramlMethod.method.toUpperCase() + ' ' + (ramlResource.displayName || ramlResource.relativeUri)) %>

_<%= ramlMethod.method.toUpperCase() %> <%= ramlResource.absoluteUri %>_
<% if (_.get(ramlMethod, 'is', []).includes('internal')) print('<Badge text="internal" type="error" />') %>

<%= ramlMethod.description %>

<%= ramlResource.description %>

    <% if (ramlResource.uriParameters || ramlMethod.queryParameters) { %>

#### Request Parameters

<table>
  <tr>
    <th>name</th>
    <th>type</th>
    <th>description</th>
  </tr>

<% _.forEach(ramlResource.uriParameters, (paramValue, param) => print(partials.param({ paramValue, param }))) %>
<% _.forEach(ramlMethod.queryParameters, (paramValue, param) => print(partials.param({ paramValue, param }))) %>

</table>

    <% } %>
    <% if (ramlMethod.body) { %>

#### Request Body

<%= ramlMethod.bodyDescription %>

<% _.forEach(ramlMethod.body, (formatValue, format) => print(partials.format({ partials, formatValue, format }))) %>

    <% } %>
    <% if (ramlMethod.responses) { %>
      <% _.forEach(ramlMethod.responses, (respValue, respKey) => { %>

#### Responses for HTTP Status Code <%= respKey %>

<%= respValue.description %>

<% _.forEach(respValue.body, (formatValue, format) => print(partials.format({ partials, formatValue, format }))) %>

      <% }) %>
    <% } %>
  <% }) %>
<% }) %>
