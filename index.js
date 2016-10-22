var fs = require('fs'),
    path = require('path'),
    couchapp = require('couchapp'),
    rewrites = require('./rewrites'),
    request  = require('./node_modules/couchapp/node_modules/request');

module.exports = function(schema_dir, dbPath, loaded_callback, pushed_callback) {

  if(!loaded_callback) {
    loaded_callback = function(){};
  }

  if (!pushed_callback) {
    pushed_callback = loaded_callback;
    loaded_callback = function(doc, cb){ cb(null, doc); };
  }

  var ddoc = require('./ddoc.js');

  ddoc.views.lib.types = {};
  var schemas = fs.readdirSync(schema_dir);
  var loaded = false;

  schemas.forEach(function(schema){

    if ( schema.indexOf('.js', schema.length - '.js'.length) === -1) return;

    loaded = true;

    var nice_name = schema.substring(0, schema.length -3); // take off .js
    var schema_path = path.join(schema_dir, schema);

    ddoc.views.lib.types[nice_name] = fs.readFileSync( schema_path ).toString()

    var to_add = rewrites(nice_name, require(schema_path));

    to_add.forEach(function(rewrite){
      ddoc.rewrites.unshift(rewrite);
    })

  });

  if (!loaded) return console.log('No schemas to push. Add some to the folder ' + schema_dir);

  couchapp.createApp(ddoc, dbPath, function (webapp) {

    // give the chance for calling app to enhance the ddoc
    loaded_callback(webapp.doc, function(err, final_doc){
      webapp.doc = final_doc;

      createDB(dbPath, function(err, resp){
        if (err) return pushed_callback(err);
        resp = JSON.parse(resp.body);
        if (resp.error && resp.error == 'unauthorized') {
              return pushed_callback("ERROR: " + resp.error + ", " + resp.reason + " (hint use -u user -p pass)");
        }
        if (resp.error && resp.error != 'file_exists')  return pushed_callback("ERROR: " + resp.error + ", " + resp.reason);
        webapp.push(pushed_callback);
      })
    })
  });
}

function createDB(dbPath, done) {
  request.put(dbPath, done);
}