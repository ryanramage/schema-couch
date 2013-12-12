var ddoc = {
  _id: '_design/schema',
  lib: {},
  views: {},
  shows: {}
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
          value = null;

      if (doc.data) {
        try {
          var schema = require('views/lib/types/' + doc.type);
          var view = schema.list_by_type;
          if (view) {
            //var jsonselect = require('views/lib/jsonselect');
            var dotaccess = require('views/lib/dotaccess');
            if (view.key) {
              for (var i=0; i < view.key.length; i++) {
                //var key_values = jsonselect.match(view.key[i], doc.data);
                var key_values = dotaccess(doc.data, view.key[i]);
                key = key.concat(key_values);
              }
            } // end view.key
            if (view.value) {
              value = {};
              for (var prop in view.value) {
                var access = view.value[prop];
                //value[prop] =  jsonselect.match(selector, doc.data);
                value[prop] = dotaccess(doc.data, access);
              }
            } // end view.value
          } //end view
        } catch(e) { log(e); }
      } // end doc.data
      emit(key, value);
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
              views = schema.belongs_to;
          for (var i = 0; i < views.length; i++) {
            var view = views[i];
            if (view && view.parent) {
              var parent_id = dotaccess(doc.data, view.parent);
              if (parent_id) {
                var key = [parent_id, doc.type],
                    value = null;
                if (view.relation) {
                  key.push(view.relation);
                }
                if (view.key) {
                  for (var j=0; j < view.key.length; j++) {
                    var key_values = dotaccess(doc.data, view.key[j]);
                    key = key.concat(key_values);
                  }
                } // end view.key
                if (view.value) {
                  value = {};
                  for (var prop in view.value) {
                    var access = view.value[prop];
                    value[prop] = dotaccess(doc.data, access);
                  }
                } // end view.value
                emit(key, value);
              } // end parent_id
            } //end view && view.parent
          } // end for views
        } catch(e) { log('in exception'); log(e); }
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
    { "description": "Access to this database" , "from": "_db" , "to"  : "../.." },
    { "from": "_db/*" , "to"  : "../../*" },
    { "description": "Access to this design document" , "from": "_ddoc" , "to"  : "" },
    { "from": "_ddoc/*" , "to"  : "*"},

    { "from": "/", "to": "index.html" },
    { "from": "/*", "to": "*" }
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
  dotaccess: "module.exports = function (obj, path) { var get = new Function('_', 'return _.' + path);  return get(obj);  };"
}

module.exports = ddoc;


function loadFile(path) {
  var fs = require('fs');
  var finalPath = __dirname + '/couchapp/' + path + '.js';
  //console.log('loading: ', __filename);
  return fs.readFileSync(finalPath).toString();
}


