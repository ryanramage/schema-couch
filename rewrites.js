module.exports = function(name, schema) {
  var rewrites = [];

  // list all by type
  rewrites.push({
    from: "/" + name,
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

  // all the filters
  if (schema.list && schema.list.filters) {
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
  }



  if (schema.has_many) {
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
  }

  if (schema.belongs_to) {
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
  }





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