module.exports = function(schema, name, rewrites) {
  // all the filters
  for (var filter_name in schema.list.filters) {
    var base = "/" + name + '/filters/' + filter_name,
        startkey = [name, filter_name],
        endkey = [name, filter_name, {}],
        base_rewrite = {
          from: base,
          to: "_view/list_by_type_and_filter",
          query: {
            reduce: "true",
            group_level: '3',
            startkey: startkey.slice(0),
            endkey: endkey.slice(0)
          }
        };

    rewrites.push(base_rewrite);

    for (var i=0; i< schema.list.filters[filter_name].length; i++) {
      var filter = schema.list.filters[filter_name][i],
          splat  = ":s" + i,
          base = base + '/' + splat;

      startkey.push(splat);
      endkey.splice(-1, 0, splat);
      var filter_rewrite = {
        from: base,
        to: "_view/list_by_type_and_filter",
        query: {
          reduce: "false",
          startkey: startkey.slice(0),
          endkey: endkey.slice(0)
        }
      };
      rewrites.push(filter_rewrite);
    }
  }
  return rewrites;
}
