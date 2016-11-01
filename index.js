var createApp = require('./createApp'),
    loadSchemas = require('./schemas/load-all'),


module.exports = function(schema_dir, dbPath, callbacks) {
  callbacks = callbacks || {};

  if (typeof callbacks === 'function') {
    callbacks = {loaded: callbacks};
  }

  callbacks.loaded = callbacks.loaded || function(){};

  if (!callbacks.pushed) {
    callbacks.pushed = callbacks.loaded;
    callbacks.loaded = function(doc, cb){ cb(null, doc); };
  }

  var ddoc = require('./ddoc');

  ddoc.views.lib.types = {};

  loadSchemas(schema_dir, ddoc);

  createApp(ddoc, dbPath, callbacks)
}
