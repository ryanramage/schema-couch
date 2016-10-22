var fs = require('fs'),
    path = require('path'),
    rewrites = require('./rewrites');

module.exports = function(schema_dir, ddoc) {
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

  if (!loaded) {
    console.error('No schemas to push. Add some to the folder ' + schema_dir);
    return false;
  }
  return true;
}
