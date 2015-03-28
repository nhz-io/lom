Model = require '../async/model'
Schema = require './schema'

module.exports = class CrudModel extends Model
  constructor: (schema, adapter) ->
    return new CrudModel schema, adapter unless this instanceof CrudModel
    schema = new Schema unless schema and schema instanceof Schema
    Object.defineProperty this, '_adapter', enumerable:false, value: adapter
    super schema

  create: (data = {}) ->
    result = super
    result.id = data.id
    return result

  sync: (data) ->
    if @_adapter?
      switch data._state
        when 'new'
          @set data, '_status', 'create in progress'
          @set data, '_state', 'busy'
          @_adapter.create? data, (err, res) =>
            if err
              @set data, '_status', err
              @set data, '_state', 'error'
            else
              @apply data, res
              @set data, '_status', 'sync'
              @set data, '_state', 'sync'

        when 'dirty'
          @set data, '_status', 'update in progress'
          @set data, '_state', 'busy'
          @_adapter.update? data, (err, res) =>
            if err
              @set data, '_state', 'error'
              @set data, '_status', err
            else
              @apply data, res
              @set data, '_state', 'sync'
              @set data, '_status', 'sync'

        when 'old'
          @set data, '_status', 'read in progress'
          @set data, '_state', 'busy'
          @_adapter.read? data, (err, res) =>
            if err
              @set data, '_state', 'error'
              @set data, '_status', err
            else
              @apply data, res
              @set data, '_state', 'sync'
              @set data, '_status', 'sync'

    return this

  set: (data, name, value) ->
    if name is 'id'
      unless data._state
        data.id = value
        @set data, '_state', 'old'
      return data.id
    super data, name, value
