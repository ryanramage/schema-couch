var couchapp = require('couchapp');
var createOnComplete = require('./create-on-complete');

module.exports = function(ddoc, dbPath, callbacks) {
  couchapp.createApp(ddoc, dbPath, function (webapp) {
    _createOnComplete = callbacks.createOnComplete || createOnComplete;

    callbacks.onComplete = _createOnComplete(dbPath, webapp, callbacks);

    // give the chance for calling app to enhance the ddoc
    callbacks.onLoaded(webapp.doc, callbacks.onComplete)
  });
}
