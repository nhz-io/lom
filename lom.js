(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.LOM = {
  NIL: require('./nil'),
  Type: require('./type'),
  Schema: require('./schema'),
  Model: require('./model'),
  types: require('./types')
};

},{"./model":2,"./nil":3,"./schema":4,"./type":5,"./types":6}],2:[function(require,module,exports){
var Model, NIL, Schema, Type, capitalize,
  hasProp = {}.hasOwnProperty;

NIL = require('./nil');

Type = require('./type');

Schema = require('./schema');

capitalize = function(s) {
  if (typeof s === 'string') {
    return (s.substr(0, 1)).toUpperCase() + (s.substr(1)).toLowerCase();
  }
};

module.exports = Model = (function() {
  function Model(schema) {
    if (!(this instanceof Model)) {
      return new Model(schema);
    }
    if (!(schema && schema instanceof Schema)) {
      schema = new Schema;
    }
    Object.defineProperty(this, '_schema', {
      configurable: false,
      writable: false,
      enumerable: false,
      value: schema
    });
  }

  Model.prototype.apply = function(data, source) {
    var name, ref, validator, value;
    ref = this._schema;
    for (name in ref) {
      if (!hasProp.call(ref, name)) continue;
      validator = ref[name];
      if ((source.hasOwnProperty(name)) && (NIL !== (value = validator.apply(source[name])))) {
        this.set(data, name, value);
      }
    }
    return data;
  };

  Model.prototype.get = function(data, name) {
    var getter;
    if (getter = this["get" + capitalize(name)]) {
      return getter.call(this, data);
    } else {
      return data[name];
    }
  };

  Model.prototype.set = function(data, name, value) {
    var setter;
    if (setter = this["set" + capitalize(name)]) {
      return setter.call(this, data, value);
    } else {
      return data[name] = value;
    }
  };

  Model.prototype.create = function(data) {
    var fn, name, ref, result, type;
    if (data == null) {
      data = {};
    }
    data = this.apply({}, data);
    result = {};
    ref = this._schema;
    fn = (function(_this) {
      return function(name, type) {
        if (name && type instanceof Type) {
          return Object.defineProperty(result, name, {
            configurable: type.configurable ? true : false,
            enumerable: type.enumerable ? true : false,
            get: function() {
              var value;
              value = _this.get(data, name);
              if (NIL !== (value = type.apply(value))) {
                return value;
              } else {
                return void 0;
              }
            },
            set: function(value) {
              if (NIL !== (value = type.apply(value))) {
                return _this.set(data, name, value);
              } else {
                return void 0;
              }
            }
          });
        }
      };
    })(this);
    for (name in ref) {
      if (!hasProp.call(ref, name)) continue;
      type = ref[name];
      fn(name, type);
    }
    return result;
  };

  Model.prototype.destroy = function(model) {
    return model;
  };

  return Model;

})();

},{"./nil":3,"./schema":4,"./type":5}],3:[function(require,module,exports){
module.exports = NIL(function() {
  return NIL;
});

},{}],4:[function(require,module,exports){
var Schema;

module.exports = Schema = (function() {
  function Schema(definition) {
    var name, type;
    if (definition == null) {
      definition = {};
    }
    if (!(this instanceof Schema)) {
      return new Schema(definition);
    }
    for (name in definition) {
      type = definition[name];
      this[name] = type;
    }
    Object.freeze(this);
  }

  return Schema;

})();

},{}],5:[function(require,module,exports){
var NIL, Type,
  slice = [].slice;

NIL = require('./nil');

module.exports = Type = (function() {
  function Type() {
    var i, options, validator;
    options = 2 <= arguments.length ? slice.call(arguments, 0, i = arguments.length - 1) : (i = 0, []), validator = arguments[i++];
    if (!(this instanceof Type)) {
      return new Type(validator);
    }
    options = options[0] || {};
    this.apply = (typeof validator === 'function' ? validator : function() {
      return NIL;
    });
    if (typeof options.configurable === 'boolean') {
      this.configurable = options.configurable;
    } else {
      this.configurable = false;
    }
    if (typeof options.enumerable === 'boolean') {
      this.enumerable = options.enumerable;
    } else {
      this.enumerable = true;
    }
    Object.freeze(this);
  }

  return Type;

})();

},{"./nil":3}],6:[function(require,module,exports){
var NIL, Type, types;

NIL = require('./nil');

Type = require('./type');

module.exports = types = {
  number: new Type(function(value) {
    if ((typeof value === 'number') || (!isNaN(value = parseFloat(value)))) {
      return value;
    } else {
      return NIL;
    }
  }),
  integer: new Type(function(value) {
    if (NIL !== (value = number.apply(value))) {
      return Math.floor(value);
    } else {
      return NIL;
    }
  }),
  regexp: new Type(function(value) {
    if (value instanceof RegExp) {
      return value;
    } else {
      return NIL;
    }
  }),
  boolean: new Type(function(value) {
    if (typeof value === 'boolean') {
      return value;
    } else {
      return NIL;
    }
  }),
  string: new Type(function(value) {
    if (typeof value === 'string') {
      return value.toString();
    } else {
      return NIL;
    }
  }),
  object: new Type(function(value) {
    if (typeof value === 'object') {
      return value;
    } else {
      return NIL;
    }
  }),
  array: new Type(function(value) {
    if (Array.isArray(value)) {
      return value;
    } else {
      return NIL;
    }
  }),
  hash: new Type(function(value) {
    if ((NIL !== types.object.apply(value)) && (NIL === array.apply(value))) {
      return value;
    } else {
      return NIL;
    }
  }),
  "function": new Type(function(value) {
    if (typeof value === 'function') {
      return value;
    } else {
      return NIL;
    }
  })
};

},{"./nil":3,"./type":5}]},{},[1])