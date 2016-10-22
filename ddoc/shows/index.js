var views = require('../views');

exports.unhandled = function(doc, req) {
    return {
        'headers' : {'Content-Type' : 'application/json'},
        'body' :  JSON.stringify({error: "not found", ok: false})
    };
}

exports.type_routes = function(doc, req) {
  var type = req.query.type;
  try {
      var schema = require('views/lib/types/' + type);
      var results = [];
      results.push('/' + type + '/list');
      results.push('/' + type + '/schema');
      if (schema.has_many) {
        schema.has_many.forEach(function(many){
          results.push(many.name);
        })
      }
      return {
          'headers' : {'Content-Type' : 'application/json'},
          'body' :  JSON.stringify(results)
      };
  } catch(e) {
      return {
          'headers' : {'Content-Type' : 'application/json'},
          'body' :  JSON.stringify({ok: false, msg: "Type not found"})
      }
  }
}

exports.has_many = function(doc, req) {
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

exports.belongs_to = function(doc, req) {
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


exports.schemas = function(doc, req) {
    var type = req.query.type;
    if (!type) {
        if (!views.lib.types) return {
            'headers' : {'Content-Type' : 'application/json'},
            'body' :  JSON.stringify({ok: false, msg: "No types found"})
        }
        var data = {};
        for (var type in views.lib.types) {
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

exports.types = function(doc, req) {
    var data = [];

    if (views.lib.types) {
      for (var type in views.lib.types) {
        data.push(type);
      }
    }

    return {
        'headers' : {'Content-Type' : 'application/json'},
        'body' :  JSON.stringify(data)
    };
}