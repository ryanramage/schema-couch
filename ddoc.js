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
    if (doc.type && doc.data) {
      try {
        var schema = require('views/lib/types/' + doc.type),
            dotaccess = require('views/lib/dotaccess'),
            jsonselect = require('views/lib/jsonselect'),
            list_by_type = require('views/lib/list_by_type');
        list_by_type(schema, doc, emit, dotaccess, jsonselect);
      } catch(e) {log(e);}
    }
  },
  reduce: "_count"
}

ddoc.views.list_by_type_and_filter = {
  map: function map(doc) {
    if (doc.type && doc.data) {
        try {
          var schema = require('views/lib/types/' + doc.type),
              dotaccess = require('views/lib/dotaccess'),
              jsonselect = require('views/lib/jsonselect'),
              list_by_type_and_filter = require('views/lib/list_by_type_and_filter');

          list_by_type_and_filter(schema, doc, emit, dotaccess, jsonselect);
        } catch(e) { log(e); }
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
              relations = require('views/lib/relations');

          relations(schema, doc, emit, dotaccess, jsonselect);
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
              relations_with_filters = require('views/lib/relations_with_filters');

          relations_with_filters (schema, doc, emit, dotaccess, jsonselect);
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
        throw({forbidden : 'A document with a type must have a data property'});
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
  list_by_type: loadFile('views/lib/list_by_type'),
  list_by_type_and_filter: loadFile('views/lib/list_by_type_and_filter'),
  relations: loadFile('views/lib/relations'),
  relations_with_filters: loadFile('views/lib/relations_with_filters'),
  types: {}
}

module.exports = ddoc;


function loadFile(path) {
  var fs = require('fs');
  var finalPath = __dirname + '/ddoc_libs/' + path + '.js';
  //console.log('loading: ', __filename);
  return fs.readFileSync(finalPath).toString();
}


