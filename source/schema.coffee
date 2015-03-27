module.exports = class Schema then constructor: (definition = {}) ->
  return new Schema definition unless this instanceof Schema
  this[name] = type for name, type of definition
  Object.freeze this
