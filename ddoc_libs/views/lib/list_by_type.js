module.exports = function(schema, doc, emit, dotaccess, jsonselect) {
  var key = [doc.type],
    value = null;

  var list = schema.list;
  if (list) {
    if (list.value) {
      value = {};
      for (var prop in list.value) {
        var selector = list.value[prop];
        if (selector[0] == '.') value[prop] = jsonselect.match(selector, doc.data);
        else value[prop] = dotaccess(doc.data, selector);
      }
    } // end list.value
  } //end list
  emit(key, value);
}