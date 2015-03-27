NIL = require './nil'
Type = require './type'

module.exports = types =
  number: new Type (value) ->
    if (typeof value is 'number') or (not isNaN value = parseFloat value)
      value
    else
      NIL

  integer: new Type (value) ->
    if NIL isnt value = types.number.apply value
      Math.floor value
    else
      NIL

  regexp: new Type (value) ->
    if value instanceof RegExp then value else NIL

  boolean: new Type (value) ->
    if typeof value is 'boolean' then value else NIL

  string: new Type (value) ->
    if typeof value is 'string' then value.toString() else NIL

  object: new Type (value) ->
    if typeof value is 'object' then value else NIL

  array: new Type (value) ->
    if Array.isArray value then value else NIL

  hash: new Type (value) ->
    if (NIL isnt  types.object.apply value) and (NIL is types.array.apply value)
      value
    else
      NIL

  function: new Type (value) ->
    if typeof value is 'function' then value else NIL
