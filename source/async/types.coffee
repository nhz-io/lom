{NIL, Type, types} = require '../core/index'

module.exports =
  state: new Type enumerable:false, (value) ->
    if value in [ 'new', 'dirty', 'sync', 'busy', 'lock', 'old', 'error' ] then value else NIL

  status : new Type enumerable:false, (value) -> types.string.apply value

  callback: new Type enumerable:false, (value) ->
    types.function.apply value
