<% /* comment: this is lodash sub-template 3 column table rows args: paramValue, param */ %>

<tr>
    <td><%= param %></td>
    <td>

<%= paramValue.type %><% if (paramValue.items) print(' of ' + paramValue.items.name) %>
<% if (_.isNumber(paramValue.minLength) || _.isNumber(paramValue.maxLength)) print(' of length ' + (paramValue.minLength || '0') + ' to ' + (paramValue.maxLength || 'any')) %>
<% if (_.isNumber(paramValue.minimum) || _.isNumber(paramValue.maximum)) {
  print('[');
  if(_.isNumber(paramValue.minimum)) print(paramValue.minimum);
  print('...');
  if(_.isNumber(paramValue.maximum)) print(paramValue.maximum);
  print(']')
}
%>
<% if (paramValue.repeat ||
  paramValue.enum ||
  paramValue.pattern) print('_(see details)_') %>
<% if (paramValue.properties || paramValue.items) print('_(see fields)_') %>

</td>
    <td>

<% if(param !== paramValue.displayName) print(paramValue.displayName) %>
<% if (paramValue.required) print('<Badge text="required" type="warn" />') %>
<% if (paramValue.uri) print('<Badge text="uri" type="tip" />') %>
<% if (_.get(paramValue, 'annotations.deprecated')) print('<Badge text="deprecated" type="error" />') %>
<% if (_.get(paramValue, 'annotations.internal')) print('<Badge text="internal" type="error" />') %>

</td>
  </tr>

<% if (paramValue.example ||
  paramValue.examples ||
  paramValue.default ||
  paramValue.description ||
  paramValue.repeat ||
  paramValue.enum ||
  paramValue.pattern) { %>

<tr>
    <td colspan="3">

_Details for <%= param %>_

<%= paramValue.description %>

<% if(paramValue.example) { %>
* Example: <%= paramValue.example %>
<% } %>
<% if(paramValue.examples) { %>
* Examples: <% _.forEach(paramValue.examples, example => print(' ' + example.value)) %>
<% } %>
<% if(paramValue.default) { %>
* Default: <%= paramValue.default %>
<% } %>
<% if (paramValue.repeat) { %>
* Type Options: a comma separated list of <%= paramValue.type + 's' %>
<% } %>
<% if (paramValue.pattern) { %>
* Type Pattern: <%= paramValue.pattern %>
<% } %>
<% if (paramValue.enum) { %>
* Type Values: <% _.forEach(paramValue.enum, (enumValue, i) => { print(enumValue); if (i < paramValue.enum.length - 1) print(', ') }) %>
<% } %>

</td>
  </tr>

<% } %>
