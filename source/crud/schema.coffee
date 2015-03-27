Schema = require '../async/schema'
types = require './types'

module.exports = class CrudSchema extends Schema
  constructor: (definition = {}) ->
    return new Schema definition unless this instanceof Schema
    definition.id = types.id
    definition._status = types.status
    super definition
