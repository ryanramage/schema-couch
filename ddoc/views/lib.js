var loadFile = require('../utils').loadFile;

module.exports = {
  dotaccess: loadFile('views/lib/dotaccess'),
  jsonselect: loadFile('views/lib/jsonselect'),
  list_by_type: loadFile('views/lib/list_by_type'),
  list_by_type_and_filter: loadFile('views/lib/list_by_type_and_filter'),
  relations: loadFile('views/lib/relations'),
  relations_with_filters: loadFile('views/lib/relations_with_filters'),
  types: {}
}
