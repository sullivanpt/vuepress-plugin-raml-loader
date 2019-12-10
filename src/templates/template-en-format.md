<% /* comment: this is lodash sub-template inside level 4 header args: formatValue, format */ %>

<% /* TODO: filter request and response types. e.g. hide xml */ %>

<% _.forEach(formatValue, (bodyTypeValue, bodyTypeKey) => { %>
  <% if (['schema', 'example'].includes(bodyTypeKey)) { %>

##### <%= bodyTypeKey %> `<%= format %>`

``` <%= format.split('/')[1] %>
<%= bodyTypeValue %>
```

  <% } %>
  <% if ('formParameters' === bodyTypeKey) { %>

##### <%= bodyTypeKey %> `<%= format %>`

<table>

    <% _.forEach(bodyTypeValue, (value, fileParameter) => { %>

<tr>
  <td colspan="2"><%= fileParameter %></td>
  </tr>

      <% _.forEach(value, (fileValue, fileKey) => { %>

<tr>
    <td><%= fileKey %></td>
    <td><%= fileValue %></td>
  </tr>

      <% }) %>
    <% }) %>

</table>

  <% } %>
<% }) %>
<% _.forEach(formatValue.examples, example => { %>

##### <%= example.displayName || example.name %> `<%= format %>`

<%= example.description %>

``` <%= format.split('/')[1] %>
<%= example.value %>
```

<% }) %>
<% if (formatValue.properties) { %>

##### schema `<%= format %>`

<%= formatValue.description %>

<table>
  <tr>
    <th>name</th>
    <th>type</th>
    <th>description</th>
  </tr>

<% _.forEach(formatValue.properties, (paramValue, param) => print(partials.param({ paramValue, param }))) %>

  <% _.forEach(formatValue.properties, (paramValue, param) => { %>
    <% if (paramValue.properties) { %>

<tr><th colspan="3"><%= paramValue.displayName || paramValue.name %> fields</th></tr>
<% /* already shown in row above - paramValue.description */ %>

<% _.forEach(paramValue.properties, (paramValue, param) => print(partials.param({ paramValue, param }))) %>

    <% } %>
  <% }) %>
  <% _.forEach(formatValue.properties, (paramValue, param) => { %>
    <% if (paramValue.items && paramValue.items.properties) { %>

<tr><th colspan="3"><%= paramValue.items.name %> fields</th></tr>
<% /* maybe TMI - paramValue.items.description */ %>

<% _.forEach(paramValue.items.properties, (paramValue, param) => print(partials.param({ paramValue, param }))) %>

    <% } %>
  <% }) %>

</table>

<% } %>
