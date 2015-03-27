(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./async/index');

},{"./async/index":2}],2:[function(require,module,exports){
module.exports = {
  Schema: require('./schema'),
  Model: require('./model'),
  types: require('./types')
};

},{"./model":3,"./schema":4,"./types":5}],3:[function(require,module,exports){
var AsyncModel, Model, Schema,
  extend = require("extends__"),
  hasProp = {}.hasOwnProperty;

Model = require('../core/model');

Schema = require('./schema');

module.exports = AsyncModel = (function(superClass) {
  extend(AsyncModel, superClass);

  function AsyncModel(schema) {
    if (!(this instanceof AsyncModel)) {
      return new AsyncModel(schema);
    }
    if (!(schema && schema instanceof Schema)) {
      schema = new Schema;
    }
    AsyncModel.__super__.constructor.call(this, schema);
  }

  AsyncModel.prototype.sync = function(data, name, value) {
    return this;
  };

  AsyncModel.prototype.set_status = function(data, value) {
    data._status = value;
    if (typeof data._notify === "function") {
      data._notify(value);
    }
    if (value === 'new' || value === 'dirty' || value === 'old') {
      this.sync(data);
    }
    return value;
  };

  return AsyncModel;

})(Model);

},{"../core/model":8,"./schema":4,"extends__":14}],4:[function(require,module,exports){
var AsyncSchema, Schema, types,
  extend = require("extends__"),
  hasProp = {}.hasOwnProperty;

Schema = require('../core/schema');

types = require('./types');

module.exports = AsyncSchema = (function(superClass) {
  extend(AsyncSchema, superClass);

  function AsyncSchema(definition) {
    if (definition == null) {
      definition = {};
    }
    if (!(this instanceof AsyncSchema)) {
      return new AsyncSchema(definition);
    }
    definition._status = types.statys;
    definition._notify = types.callback;
    AsyncSchema.__super__.constructor.call(this, definition);
  }

  return AsyncSchema;

})(Schema);

},{"../core/schema":10,"./types":5,"extends__":14}],5:[function(require,module,exports){
var NIL, Type, ref, types;

ref = require('../core/index'), NIL = ref.NIL, Type = ref.Type, types = ref.types;

module.exports = {
  status: new Type({
    enumerable: false
  }, function(value) {
    if (value === 'new' || value === 'dirty' || value === 'sync' || value === 'old' || value === 'error') {
      return value;
    } else {
      return NIL;
    }
  }),
  callback: new Type({
    enumerable: false
  }, function(value) {
    return types["function"].apply(value);
  })
};

},{"../core/index":7}],6:[function(require,module,exports){
require('./core/index');

},{"./core/index":7}],7:[function(require,module,exports){
module.exports = {
  NIL: require('./nil'),
  Type: require('./type'),
  Schema: require('./schema'),
  Model: require('./model'),
  types: require('./types')
};

},{"./model":8,"./nil":9,"./schema":10,"./type":11,"./types":12}],8:[function(require,module,exports){
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

},{"./nil":9,"./schema":10,"./type":11}],9:[function(require,module,exports){
var NIL;

module.exports = NIL = function() {
  return NIL;
};

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./nil":9}],12:[function(require,module,exports){
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
    if (NIL !== (value = types.number.apply(value))) {
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
    if ((NIL !== types.object.apply(value)) && (NIL === types.array.apply(value))) {
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

},{"./nil":9,"./type":11}],13:[function(require,module,exports){
window.LOM = {
  core: require('./core'),
  async: require('./async')
};

},{"./async":1,"./core":6}],14:[function(require,module,exports){
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

module.exports = function(ChildClass, ParentClass) {
  return extend(ChildClass, ParentClass);
};

},{}]},{},[13])