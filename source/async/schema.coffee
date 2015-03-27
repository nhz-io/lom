Schema = require '../core/schema'
types = require './types'

module.exports = class AsyncSchema extends Schema
  constructor: (definition = {}) ->
    return new AsyncSchema definition unless this instanceof AsyncSchema
    definition._status = types.statys
    definition._notify = types.callback
    super definition
