(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./async/index');

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

  AsyncModel.prototype.apply = function(data, source) {
    var _state, result;
    _state = data._state;
    data._state = 'lock';
    result = AsyncModel.__super__.apply.call(this, data, source);
    data._state = _state;
    return result;
  };

  AsyncModel.prototype.sync = function(data, name, value) {
    return this;
  };

  AsyncModel.prototype.set = function(data, name, value) {
    var result;
    result = AsyncModel.__super__.set.call(this, data, name, value);
    if (data._state !== 'lock') {
      if (name !== '_state' && name !== '_status' && name !== '_notify') {
        this.set(data, '_state', (data._state ? 'dirty' : 'new'));
      }
    }
    return result;
  };

  AsyncModel.prototype.set_state = function(data, value) {
    data._state = value;
    if (typeof data._notify === "function") {
      data._notify(value, data._status);
    }
    if (value === 'init' || value === 'new' || value === 'dirty' || value === 'old') {
      this.sync(data);
    }
    return value;
  };

  return AsyncModel;

})(Model);

},{"../core/model":8,"./schema":4,"extends__":19}],4:[function(require,module,exports){
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
    definition._state = types.state;
    definition._status = types.status;
    definition._notify = types.callback;
    AsyncSchema.__super__.constructor.call(this, definition);
  }

  return AsyncSchema;

})(Schema);

},{"../core/schema":10,"./types":5,"extends__":19}],5:[function(require,module,exports){
var NIL, Type, ref, states, types,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

ref = require('../core/index'), NIL = ref.NIL, Type = ref.Type, types = ref.types;

states = ['init', 'new', 'dirty', 'sync', 'busy', 'lock', 'old', 'error'];

module.exports = {
  state: new Type({
    enumerable: false
  }, function(value) {
    if (indexOf.call(states, value) >= 0) {
      return value;
    } else {
      return NIL;
    }
  }),
  status: new Type({
    enumerable: false
  }, function(value) {
    return types.string.apply(value);
  }),
  callback: new Type({
    enumerable: false
  }, function(value) {
    return types["function"].apply(value);
  })
};

},{"../core/index":7}],6:[function(require,module,exports){
module.exports = require('./core/index');

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
      if (validator.enumerable) {
        if ((source.hasOwnProperty(name)) && (NIL !== (value = validator.apply(source[name])))) {
          this.set(data, name, value);
        }
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
module.exports = require('./crud/index');

},{"./crud/index":14}],14:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"./model":15,"./schema":16,"./types":17}],15:[function(require,module,exports){
var CrudModel, Model, Schema,
  extend = require("extends__"),
  hasProp = {}.hasOwnProperty;

Model = require('../async/model');

Schema = require('./schema');

module.exports = CrudModel = (function(superClass) {
  extend(CrudModel, superClass);

  function CrudModel(schema, adapter) {
    if (!(this instanceof CrudModel)) {
      return new CrudModel(schema, adapter);
    }
    if (!(schema && schema instanceof Schema)) {
      schema = new Schema;
    }
    Object.defineProperty(this, '_adapter', {
      enumerable: false,
      value: adapter
    });
    CrudModel.__super__.constructor.call(this, schema);
  }

  CrudModel.prototype.create = function(data) {
    var result;
    if (data == null) {
      data = {};
    }
    result = CrudModel.__super__.create.apply(this, arguments);
    result.id = data.id;
    return result;
  };

  CrudModel.prototype.sync = function(data) {
    var base, base1, base2, base3;
    if (this._adapter != null) {
      switch (data._state) {
        case 'new':
          this.set(data, '_status', 'create in progress');
          this.set(data, '_state', 'busy');
          if (typeof (base = this._adapter).create === "function") {
            base.create(data, (function(_this) {
              return function(err, res) {
                if (err) {
                  _this.set(data, '_status', err);
                  return _this.set(data, '_state', 'error');
                } else {
                  _this.apply(data, res);
                  _this.set(data, '_status', 'sync');
                  return _this.set(data, '_state', 'sync');
                }
              };
            })(this));
          }
          break;
        case 'dirty':
          this.set(data, '_status', 'update in progress');
          this.set(data, '_state', 'busy');
          if (typeof (base1 = this._adapter).update === "function") {
            base1.update(data, (function(_this) {
              return function(err, res) {
                if (err) {
                  _this.set(data, '_state', 'error');
                  return _this.set(data, '_status', err);
                } else {
                  _this.apply(data, res);
                  _this.set(data, '_state', 'sync');
                  return _this.set(data, '_status', 'sync');
                }
              };
            })(this));
          }
          break;
        case 'old':
          this.set(data, '_status', 'read in progress');
          this.set(data, '_state', 'busy');
          if (typeof (base2 = this._adapter).read === "function") {
            base2.read(data, (function(_this) {
              return function(err, res) {
                if (err) {
                  _this.set(data, '_state', 'error');
                  return _this.set(data, '_status', err);
                } else {
                  _this.apply(data, res);
                  _this.set(data, '_state', 'sync');
                  return _this.set(data, '_status', 'sync');
                }
              };
            })(this));
          }
          break;
        case 'init':
          this.set(data, '_status', 'init in progress');
          if (typeof (base3 = this._adapter).read === "function") {
            base3.read(data, (function(_this) {
              return function(err, res) {
                if (err) {
                  _this.set(data, '_state', 'error');
                  return _this.set(data, '_status', err);
                } else {
                  _this.apply(data, res);
                  _this.set(data, '_state', 'sync');
                  return _this.set(data, '_status', 'sync');
                }
              };
            })(this));
          }
      }
    }
    return this;
  };

  CrudModel.prototype.set = function(data, name, value) {
    if (name === 'id') {
      if (!data._state || data._state === 'init') {
        data.id = value;
        this.set(data, '_state', 'old');
      }
      return data.id;
    }
    return CrudModel.__super__.set.call(this, data, name, value);
  };

  return CrudModel;

})(Model);

},{"../async/model":3,"./schema":16,"extends__":19}],16:[function(require,module,exports){
var CrudSchema, Schema, types,
  extend = require("extends__"),
  hasProp = {}.hasOwnProperty;

Schema = require('../async/schema');

types = require('./types');

module.exports = CrudSchema = (function(superClass) {
  extend(CrudSchema, superClass);

  function CrudSchema(definition) {
    if (definition == null) {
      definition = {};
    }
    if (!(this instanceof Schema)) {
      return new Schema(definition);
    }
    definition.id || (definition.id = types.id);
    CrudSchema.__super__.constructor.call(this, definition);
  }

  return CrudSchema;

})(Schema);

},{"../async/schema":4,"./types":17,"extends__":19}],17:[function(require,module,exports){
var Type, ref, types;

ref = require('../core/index'), Type = ref.Type, types = ref.types;

module.exports = {
  id: new Type(function(value) {
    return types.integer.apply(value);
  })
};

},{"../core/index":7}],18:[function(require,module,exports){
window.LOM = {
  core: require('./core'),
  async: require('./async'),
  crud: require('./crud')
};

},{"./async":1,"./core":6,"./crud":13}],19:[function(require,module,exports){
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

module.exports = function(ChildClass, ParentClass) {
  return extend(ChildClass, ParentClass);
};

},{}]},{},[18])