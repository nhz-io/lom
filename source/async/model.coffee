Model = require '../core/model'
Schema = require './schema'

module.exports = class AsyncModel extends Model
  constructor: (schema) ->
    return new AsyncModel schema unless this instanceof AsyncModel
    unless schema and schema instanceof Schema then schema = new Schema
    super schema

  apply: (data, source) ->
    _state = data._state
    data._state = 'lock'
    result = super data, source
    data._state = _state
    return result

  sync: (data, name, value) -> this

  set: (data, name, value) ->
    result = super data, name, value
    if data._state isnt 'lock'
      if name isnt '_state' and name isnt '_status' and name isnt '_notify'
        @set data, '_state', (if data._state then 'dirty' else 'new')
    return result

  set_state: (data, value) ->
    data._state = value
    data._notify? value, data._status
    if value in [ 'new', 'dirty', 'old' ] then @sync data
    return value
