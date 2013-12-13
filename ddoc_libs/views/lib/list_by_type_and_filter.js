module.exports = function(schema, doc, emit, dotaccess, jsonselect) {

  var key = [doc.type],
      value = null,
      emitted_once = false,
      list = schema.list;

  if (list) {

    if (list.value) {
      value = {};
      for (var prop in list.value) {
        var selector = list.value[prop];
        if (selector[0] == '.') value[prop] = jsonselect.match(selector, doc.data);
        else value[prop] = dotaccess(doc.data, selector);
      }
    } // end list.value

    if (list.filters) {
      for (var filter_name in list.filters) {
        var filter_key = [doc.type, filter_name];
        list.filters[filter_name].forEach(function(filter_selector){
          if (selector[0] == '.') filter_key = filter_key.concat( jsonselect.match(filter_selector, doc.data) );
          else filter_key = filter_key.concat( dotaccess(doc.data, filter_selector) );
        });
        emit(filter_key, value);
        emitted_once = true;
      }
    } // end list.filters

  } //end list
  return emitted_once;
}