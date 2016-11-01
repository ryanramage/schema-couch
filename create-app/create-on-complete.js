var request  = require('./node_modules/couchapp/node_modules/request');

function createDB(dbPath, done) {
  request.put(dbPath, done);
}

module.exports = function(dbPath, webapp, callbacks) {
  return function(err, final_doc) {
    webapp.doc = final_doc;
    var onPushed = callbacks.onPushed;

    createDB(dbPath, function(err, resp) {
      if (err) return onPushed(err);

      resp = JSON.parse(resp.body);

      if (resp.error) {

        switch (resp.error) {
          case 'unauthorized':
            return onPushed("ERROR: " + resp.error + ", " + resp.reason + " (hint use -u user -p pass)");
          case 'file_exists':
            return onPushed("ERROR: " + resp.error + ", " + resp.reason + " (file exists)");
          default:
            return onPushed("ERROR: " + resp.error + ", " + resp.reason);
        }
      }
      webapp.push(onPushed);
    })
  }
}
