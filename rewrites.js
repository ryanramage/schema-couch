
   // { "from": "/quiz/:a/submissions" , "to"  : "_view/relations", "query": { "startkey": [":a", "submission"], "endkey": [":a", "submission", {}]  } },
   //  { "from": "/quiz/:a/difficulty_subquestions", "to"  : "_view/relations", "query": { "startkey": [":a", "quiz", "difficulty"], "endkey": [":a", "quiz", "difficulty", {}]  } },
   //  { "from": "/quiz/:a/category_subquestions", "to"  : "_view/relations", "query": { "startkey": [":a", "quiz", "category"], "endkey": [":a", "quiz", "category", {}]  } },

// / -> list all types
// /quiz  -> list all quizes
// /quiz/schema
// /quiz/filters -> [category,difficulty]
// /quiz/filters/category -> list quiz category counts (where category is in quiz.list.filters)
// /quiz/filters/category/film -> first level filter
// /quiz/filters/catagory/film/5 -> second level filter

// /quiz/id/322323232323233223 -> quiz json
// /quiz/id/322323232323233223/has_many -> list they types of children
// /quiz/id/322323232323233223/has_many/submissions -> list related submissions
// /quiz/id/322323232323233223/has_many/submissions/filters -> []
// /quiz/id/322323232323233223/has_many/related/filters -> [category, difficulty]
// /quiz/id/322323232323233223/has_many/subquestions/filters -> [category, difficulty]
// /quiz/id/322323232323233223/has_many/subquestions/filters/category -> list quiz category counts
// /quiz/id/322323232323233223/has_many/subquestions/filters/category/film ->
// /quiz/id/322323232323233223/belongs_to -> [related_from, parent_quiz]
// /quiz/id/322323232323233223/belongs_to/related_from -> many docs?
// /quiz/id/322323232323233223/belongs_to/parent_quiz -> one doc

// /submission -> list all submissions
// /submission/filters -> []
// /submission/ddsddsdsdsdsdsdsds/has_many -> []
// /submission/ddsddsdsdsdsdsdsds/belongs_to -> [quiz, user]
// /submission/ddsddsdsdsdsdsdsds/belongs_to/quiz -> one doc
// /submission/ddsddsdsdsdsdsdsds/belongs_to/user -> one doc

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