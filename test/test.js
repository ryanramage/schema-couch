var schemaCouch = require('..');


schemaCouch(__dirname + '/schemas', 'http://admin:admin@localhost:5984/schema_couch', function(err, data){
  console.log(err, data);
});