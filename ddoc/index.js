var ddoc = {
  _id: '_design/schema',
  lib: require('./lib'),
  views: require('./views'),
  shows: require('./shows'),
  rewrites: require('./rewrites'),
  validate_doc_update: require('./validate/doc-update')
}

module.exports = ddoc;


