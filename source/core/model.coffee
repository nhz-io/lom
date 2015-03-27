NIL = require './nil'
Type = require './type'
Schema = require './schema'

capitalize = (s) ->
  if typeof s is 'string'
    return (s.substr 0, 1).toUpperCase() + (s.substr 1).toLowerCase()

module.exports = class Model
  constructor: (schema) ->
    return new Model schema unless this instanceof Model
    unless schema and schema instanceof Schema then schema = new Schema
    Object.defineProperty this, '_schema',
      configurable : false
      writable     : false
      enumerable   : false
      value        : schema

  apply: (data, source) ->
    for own name, validator of @_schema
      if validator.enumerable
        if (source.hasOwnProperty name) and (NIL isnt value = validator.apply source[name])
          @set data, name, value
    return data

  get: (data, name) ->
    if getter = this["get" + capitalize name]
      getter.call this, data
    else
      data[name]

  set: (data, name, value) ->
    if setter = this["set" + capitalize name]
      setter.call this, data, value
    else
      data[name] = value

  create: (data = {}) ->
    data = @apply {}, data
    result = {}
    for own name, type of @_schema then do (name, type) =>
      if name and type instanceof Type
        Object.defineProperty result, name,
          configurable : if type.configurable then true else false
          enumerable   : if type.enumerable then true else false

          get: =>
            value = @get data, name
            if NIL isnt value = type.apply value
              return value
            else
              return undefined

          set: (value) =>
            if NIL isnt value = type.apply value
              return @set data, name, value
            else
              return undefined

    return result

  destroy: (model) -> model
