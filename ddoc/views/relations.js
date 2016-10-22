module.exports = {
  map: function (doc) {
    if (doc.type && doc.data) {
        try {
          var schema = require('views/lib/types/' + doc.type),
              dotaccess = require('views/lib/dotaccess'),
              jsonselect = require('views/lib/jsonselect'),
              relations = require('views/lib/relations');

          relations(schema, doc, emit, dotaccess, jsonselect);
        } catch(e) {  log(e); }
    }
  },
  reduce: '_count'
}