{NIL, Type, types} = require '../core/index'

states = [ 'init', 'new', 'dirty', 'sync', 'busy', 'lock', 'old', 'error' ]

module.exports =
  state: new Type enumerable:false, (value) -> if value in states then value else NIL

  status : new Type enumerable:false, (value) -> types.string.apply value

  callback: new Type enumerable:false, (value) ->
    types.function.apply value
