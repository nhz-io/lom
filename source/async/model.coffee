Model = require '../core/model'
Schema = require './schema'

module.exports = class AsyncModel extends Model
  constructor: (schema) ->
    return new AsyncModel schema unless this instanceof AsyncModel
    unless schema and schema instanceof Schema then schema = new Schema
    super schema

  sync: (data, name, value) -> this

  set_status: (data, value) ->
    data._status = value
    data._notify? value
    if value in [ 'new', 'dirty', 'old' ] then @sync data
    return value
