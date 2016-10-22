module.exports = function(schema, name, rewrites) {
  schema.belongs_to.forEach(function(belongs){

    // the listing of children filters, using grouping
    rewrites.push({
      from: "/" + name + "/id/:uid/has_many/" + belongs.many_name + '/filters',
      to: "_view/relations_with_filters",
      query: {
        reduce: "true",
        group_level: '3',
        startkey: [":uid", belongs.many_name],
        endkey:   [":uid", belongs.many_name, {}]
      }
    });

    // children filters
    if (belongs.filters) {
      for (var filter_name in belongs.filters) {
        var base = "/" + name + "/id/:uid/has_many/" + belongs.many_name + '/filters/' + filter_name,
            startkey = [":uid", belongs.many_name, filter_name],
            endkey   = [":uid", belongs.many_name, filter_name, {}],
            base_rewrite = {
              from: base,
              to: "_view/relations_with_filters",
              query: {
                reduce: "true",
                group_level: '4',
                startkey: startkey.slice(0),
                endkey: endkey.slice(0)
              }
            };
        rewrites.push(base_rewrite);
        for (var i=0; i< belongs.filters[filter_name].length; i++) {
          var filter = belongs.filters[filter_name][i],
              splat  = ":s" + i,
              base = base + '/' + splat;

          startkey.push(splat);
          endkey.splice(-1, 0, splat);
          var filter_rewrite = {
            from: base,
            to: "_view/relations_with_filters",
            query: {
              reduce: "false",
              startkey: startkey.slice(0),
              endkey: endkey.slice(0)
            }
          };
          rewrites.push(filter_rewrite);
        }
      }
    }
  })
  return rewrites;
}