NIL = require './nil'
module.exports = class Type then constructor: (options..., validator) ->
  return new Type validator unless this instanceof Type
  options = options[0] or {}
  @apply = (if typeof validator is 'function' then validator else -> NIL)
  if typeof options.configurable is 'boolean'
    @configurable = options.configurable
  else
    @configurable = false
  if typeof options.enumerable is 'boolean'
    @enumerable = options.enumerable
  else
    @enumerable = true
  Object.freeze this
