Model = require '../async/model'
Schema = require './schema'

module.exports = class CrudModel extends Model
  constructor: (schema, adapter) ->
    return new CrudModel schema, adapter unless this instanceof CrudModel
    schema = new Schema unless schema and schema instanceof Schema
    Object.defineProperty this, '_adapter', enumerable:false, value: adapter
    super schema

  create: (data = {}) ->

    result = super data
    return result

  sync: (data) ->
    if @_adapter?
      switch data._state
        when 'new'
          @_adapter.create? data, (err, res) =>
            if err
              @set data, '_state', 'error'
              @set data, '_status', err
            else
              @apply data, res
              @set data, '_state', 'sync'
              @set data, '_status', 'sync'

        when 'dirty'
          @_adapter.update? data, (err, res) =>
            if err
              @set data, '_state', 'error'
              @set data, '_status', err
            else
              @apply data, res
              @set data, '_state', 'sync'
              @set data, '_status', 'sync'

        when 'old'
          @_adapter.read? data, (err, res) =>
            if err
              @set data, '_state', 'error'
              @set data, '_status', err
            else
              @apply data, res
              @set data, '_state', 'sync'
              @set data, '_status', 'sync'

    return this
