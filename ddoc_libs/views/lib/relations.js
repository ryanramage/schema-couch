module.exports = function(schema, doc, emit, dotaccess, jsonselect) {
  var belongs_to = schema.belongs_to;

  for (var i = 0; i < belongs_to.length; i++) {
    var belongs = belongs_to[i];
    if (belongs && belongs.foreign_key && belongs.many_name) {
      var keys = [];
      if (belongs.foreign_key[0] == '.') {
        keys = keys.concat.apply(keys,jsonselect.match(belongs.foreign_key, doc.data));
      }
      else {
        var key_value = dotaccess(doc.data, belongs.foreign_key);
        if (key_value) keys = [ key_value ];
      }
      for (var x in keys) {
        var foreign_key = keys[x],
            value = null;

        if (belongs.value) {
          value = {};
          for (var prop in belongs.value) {
            var selector = belongs.value[prop];
            if (selector[0] == '.') value[prop] = jsonselect.match(selector, doc.data);
            else value[prop] = dotaccess(doc.data, selector);
          }
        } // end belongs.value

        var key = [foreign_key, belongs.many_name];

        if (belongs.extra_keys) {
          for (var j=0; j < belongs.extra_keys.length; j++) {
            var selector = belongs.extra_keys[j];
            if (selector[0] == '.') key = key.concat( jsonselect.match(selector, doc.data) );
            else key = key.concat( dotaccess(doc.data, selector) );
          }
        } // end belongs.extra_keys
        emit(key, value);
      } // end keys.forEach
    } //end belongs && belongs.parent
  } // end for belongs_to
}