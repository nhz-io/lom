{NIL, Type, types} = require '../core/index'

module.exports =
  status: new Type enumerable:false, (value) ->
    if value in [ 'new', 'dirty', 'sync', 'old', 'error' ] then value else NIL

  callback: new Type enumerable:false, (value) ->
    types.function.apply value
