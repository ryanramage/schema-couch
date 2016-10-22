module.exports = {
  map: function (doc) {
    if (doc.type && doc.data) {
        try {
          var schema = require('views/lib/types/' + doc.type),
              dotaccess = require('views/lib/dotaccess'),
              jsonselect = require('views/lib/jsonselect'),
              relations_with_filters = require('views/lib/relations_with_filters');

          relations_with_filters (schema, doc, emit, dotaccess, jsonselect);
        } catch(e) {  log(e); }
    }
  },
  reduce: '_count'
}