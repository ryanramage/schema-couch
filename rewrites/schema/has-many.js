module.exports = function(schema, name, rewrites) {
  schema.has_many.forEach(function(many){

    // the direct children
    var rewrite = {};
    rewrite.from = "/" + name + "/id/:uid/has_many/" + many.name;
    rewrite.to   = "_view/relations";
    rewrite.query = { "reduce": "false" };
    rewrite.query.startkey = [":uid", many.name];
    rewrite.query.endkey   = [":uid", many.name];
    rewrite.query.endkey.push({});
    rewrites.push(rewrite);
  })
  return rewrites;
}