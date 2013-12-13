var ddoc = {
  _id: '_design/schema',
  lib: {},
  views: {},
  shows: {}
}

ddoc.shows.has_many = function(doc, req) {
  var type = req.query.type;
  try {
      var schema = require('views/lib/types/' + type);
      var results = [];
      if (schema.has_many) {
        schema.has_many.forEach(function(many){
          results.push(many.name);
        })
      }
      return {
          'headers' : {'Content-Type' : 'application/json'},
          'body' :  JSON.stringify({rows: results})
      };
  } catch(e) {
      return {
          'headers' : {'Content-Type' : 'application/json'},
          'body' :  JSON.stringify({ok: false, msg: "Type not found"})
      }
  }
}

ddoc.shows.belongs_to = function(doc, req) {
  var type = req.query.type;
  try {
      var schema = require('views/lib/types/' + type);
      var results = [];
      if (schema.belongs_to) {
        schema.belongs_to.forEach(function(belongs_to){
          var name = belongs_to.name || belongs_to.type;
          results.push(name);
        })
      }
      return {
          'headers' : {'Content-Type' : 'application/json'},
          'body' :  JSON.stringify({rows: results})
      };
  } catch(e) {
      return {
          'headers' : {'Content-Type' : 'application/json'},
          'body' :  JSON.stringify({ok: false, msg: "Type not found"})
      }
  }
}


ddoc.shows.schemas = function(doc, req) {
    var type = req.query.type;
    if (!type) {
        if (!this.views.lib.types) return {
            'headers' : {'Content-Type' : 'application/json'},
            'body' :  JSON.stringify({ok: false, msg: "No types found"})
        }
        var data = {};
        for (var type in this.views.lib.types) {
            try {
                var schema = require('views/lib/types/' + type);
                data[type] = schema;
            } catch(e){}
        }
        return {
            'headers' : {'Content-Type' : 'application/json'},
            'body' :  JSON.stringify(data)
        };
    }

    try {
        var schema = require('views/lib/types/' + type);
        return {
            'headers' : {'Content-Type' : 'application/json'},
            'body' :  JSON.stringify(schema)
        };
    } catch(e) {
        return {
            'headers' : {'Content-Type' : 'application/json'},
            'body' :  JSON.stringify({ok: false, msg: "Type not found"})
        }
    }
}

ddoc.shows.types = function(doc, req) {
    log(this);
    var data = [];

    if (this.views.lib.types) {
      for (var type in this.views.lib.types) {
        data.push(type);
      }
    }

    return {
        'headers' : {'Content-Type' : 'application/json'},
        'body' :  JSON.stringify(data)
    };
}

ddoc.views.list_by_type = {
  map: function map(doc) {
    if (doc.type) {
      var key = [doc.type],
          value = null,
          emitted_once = false;

      if (doc.data) {
        try {
          var schema = require('views/lib/types/' + doc.type);
          var list = schema.list;
          if (list) {
            var dotaccess = require('views/lib/dotaccess');
            var jsonselect = require('views/lib/jsonselect');

            if (list.value) {
              value = {};
              for (var prop in list.value) {
                var selector = list.value[prop];
                if (selector[0] == '.') value[prop] = jsonselect.match(selector, doc.data);
                else value[prop] = dotaccess(doc.data, selector);
              }
            } // end list.value
          } //end list
        } catch(e) {}
      } // end doc.data
      emit(key, value);
    }
  },
  reduce: "_count"
}

ddoc.views.list_by_type_and_filter = {
  map: function map(doc) {
    if (doc.type) {
      var key = [doc.type],
          value = null,
          emitted_once = false;

      if (doc.data) {
        try {
          var schema = require('views/lib/types/' + doc.type);
          var list = schema.list;
          if (list) {
            var dotaccess = require('views/lib/dotaccess');
            var jsonselect = require('views/lib/jsonselect');

            if (list.value) {
              value = {};
              for (var prop in list.value) {
                var selector = list.value[prop];
                if (selector[0] == '.') value[prop] = jsonselect.match(selector, doc.data);
                else value[prop] = dotaccess(doc.data, selector);
              }
            } // end list.value

            if (list.filters) {
              for (var filter_name in list.filters) {
                var filter_key = [doc.type, filter_name];
                list.filters[filter_name].forEach(function(filter_selector){
                  if (selector[0] == '.') filter_key = filter_key.concat( jsonselect.match(filter_selector, doc.data) );
                  else filter_key = filter_key.concat( dotaccess(doc.data, filter_selector) );
                });
                emit(filter_key, value);
                emitted_once = true;
              }
            } // end list.filters
          } //end list
        } catch(e) { log('oops'); log(e); }
      } // end doc.data
      if (!emitted_once) emit(key, value);
    }
  },
  reduce: "_count"
}



ddoc.views.relations = {
  map: function map(doc) {
    if (doc.type && doc.data) {
        try {
          var schema = require('views/lib/types/' + doc.type),
              dotaccess = require('views/lib/dotaccess'),
              jsonselect = require('views/lib/jsonselect'),
              belongs_to = schema.belongs_to;
          for (var i = 0; i < belongs_to.length; i++) {
            var belongs = belongs_to[i];
            if (belongs && belongs.foreign_key && belongs.many_name) {
              var keys = [];
              if (belongs.foreign_key[0] == '.') {
                keys = keys.concat.apply(keys,jsonselect.match(belongs.foreign_key, doc.data));
              }
              else {
                var key_value = dotaccess(doc.data, belongs.foreign_key);
                if (key_value) keys = [ key_value ];
              }
              for (var x in keys) {
                var foreign_key = keys[x],
                    value = null;

                if (belongs.value) {
                  value = {};
                  for (var prop in belongs.value) {
                    var selector = belongs.value[prop];
                    if (selector[0] == '.') value[prop] = jsonselect.match(selector, doc.data);
                    else value[prop] = dotaccess(doc.data, selector);
                  }
                } // end belongs.value

                var key = [foreign_key, belongs.many_name];

                if (belongs.extra_keys) {
                  for (var j=0; j < belongs.extra_keys.length; j++) {
                    var selector = belongs.extra_keys[j];
                    if (selector[0] == '.') key = key.concat( jsonselect.match(selector, doc.data) );
                    else key = key.concat( dotaccess(doc.data, selector) );
                  }
                } // end belongs.extra_keys
                emit(key, value);
              } // end keys.forEach
            } //end belongs && belongs.parent
          } // end for belongs_to
        } catch(e) {  log(e); }
    }
  },
  reduce: '_count'
}

ddoc.views.relations_with_filters = {
  map: function map(doc) {
    if (doc.type && doc.data) {
        try {
          var schema = require('views/lib/types/' + doc.type),
              dotaccess = require('views/lib/dotaccess'),
              jsonselect = require('views/lib/jsonselect'),
              belongs_to = schema.belongs_to;
          for (var i = 0; i < belongs_to.length; i++) {
            var belongs = belongs_to[i];
            if (belongs && belongs.foreign_key && belongs.many_name) {
              var keys = [];
              if (belongs.foreign_key[0] == '.') {
                keys = keys.concat.apply(keys,jsonselect.match(belongs.foreign_key, doc.data));
              }
              else {
                var key_value = dotaccess(doc.data, belongs.foreign_key);
                if (key_value) keys = [ key_value ];
              }
              for (var x in keys) {
                var foreign_key = keys[x],
                    value = null;

                if (belongs.value) {
                  value = {};
                  for (var prop in belongs.value) {
                    var selector = belongs.value[prop];
                    if (selector[0] == '.') value[prop] = jsonselect.match(selector, doc.data);
                    else value[prop] = dotaccess(doc.data, selector);
                  }
                } // end belongs.value

                if (belongs.filters) {
                  for (var filter_name in belongs.filters) {
                    var filter_key = [foreign_key, belongs.many_name, filter_name];
                    belongs.filters[filter_name].forEach(function(filter_selector){
                      if (selector[0] == '.') filter_key = filter_key.concat( jsonselect.match(filter_selector, doc.data) );
                      else filter_key = filter_key.concat( dotaccess(doc.data, filter_selector) );
                    });
                    emit(filter_key, value);
                  }
                }
              } // end keys.forEach
            } //end belongs && belongs.parent
          } // end for belongs_to
        } catch(e) {  log(e); }
    }
  },
  reduce: '_count'
}

ddoc.validate_doc_update = function(newDoc, oldDoc, userCtx) {

    // Don't validate documents being deleted
    if (newDoc._deleted) {
        return;
    }
    if (!newDoc.type) {
        return
    }
    if (!newDoc.data) {
        throw({forbidden : 'A document with a type must have a data object'});
    }
    var schema;
    try {
        schema = require('views/lib/types/' + newDoc.type);
    } catch(e) {
        // no schema found
        return;
    }

    var JSV = require("lib/jsv").JSV,
        env = JSV.createEnvironment('json-schema-draft-03'),
        report = env.validate(newDoc.data, schema),
        property;

    if (report.errors.length) {
        // Can only throw one error at a time (without stringifying)
        // See issue: COUCHDB-1635
        property = report.errors[0].uri.split('/')[1];
        throw({forbidden: report.errors[0].message + " : " + property});
    }

}

ddoc.rewrites = [
    { from: '_db'     , to  : '../..',    description: "Access to this database"  },
    { from: '_db/*'   , to  : '../../*' },
    { from: '_ddoc'   , to  : '',     description: "Access to this design document"  },
    { from: '_ddoc/*' , to  : '*'},

    { from: '/:type/schema', to: '_show/schemas', query: { type: ':type' }},
    { from: '/', to: '_view/list_by_type', query: { reduce: 'true', group_level: '1' }},
    { from: '/*', to: '*' }
]

ddoc.lib = {};
ddoc.lib.environments = loadFile('lib/environments');
ddoc.lib.jsv = loadFile('lib/jsv');
ddoc.lib.validate = loadFile('lib/validate');
ddoc.lib.uri = {};
ddoc.lib.uri.uri = loadFile('lib/uri/uri');
ddoc.lib.uri.schemes = {};
ddoc.lib.uri.schemes.urn = loadFile('lib/uri/schemes/urn');


ddoc.views.lib = {
  dotaccess: loadFile('views/lib/dotaccess'),
  jsonselect: loadFile('views/lib/jsonselect'),
  types: {}
}

module.exports = ddoc;


function loadFile(path) {
  var fs = require('fs');
  var finalPath = __dirname + '/couchapp/' + path + '.js';
  //console.log('loading: ', __filename);
  return fs.readFileSync(finalPath).toString();
}


