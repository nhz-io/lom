{Type, types} = require '../core/index'

module.exports =
  id     : new Type (value) -> types.integer.apply value

