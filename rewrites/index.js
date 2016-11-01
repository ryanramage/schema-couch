module.exports = function(name, schema) {
  var rewrites = [];

  // list all by type
  rewrites.push({
    from: "/" + name + '/list',
    to: "_view/list_by_type",
    query: {
      reduce: "false",
      startkey: [name],
      endkey: [name, {}]
    }
  });

  // filters enumeration, using grouping
  rewrites.push({
    from: "/" + name + "/filters",
    to: "_view/list_by_type_and_filter",
    query: {
      reduce: "true",
      group_level: '2',
      startkey: [name],
      endkey: [name, {}]
    }
  });

  // a path for id by type (mainly as an anchor for deeper paths)
  rewrites.push({
    from: "/" + name + "/id/:uid",
    to: "../../:uid"
  });

  // a path to see the belongs_to
  rewrites.push({
    from: "/" + name + "/id/:uid/belongs_to",
    to: "_show/belongs_to",
    query: {
      type: name
    }
  });

  if (schema.list && schema.list.filters)
    rewrites = require('./schema/list')(schema, name, rewrites);


  if (schema.has_many)
    rewrites = require('./schema/has-many')(schema, name, rewrites);

  if (schema.belongs_to)
    rewrites = require('./schema/belongs-to')(schema, name, rewrites);

  // a path to see the many
  rewrites.push({
    from: "/" + name + "/id/:uid/has_many",
    to: "_show/has_many",
    query: {
      type: name
    }
  });

  return rewrites;
}