schema-couch
=============

Yes, yes, couchdb is schemaless, but sometimes, it is really nice to have a some 'typed' json docs.

schema-couch takes a directory full of schemas, and creates a couchdb design-doc that helps you with
doc manipulation, queries and relationships based on those schemas. Validation, navigation, a decent api, all in a
very minimal package.

Usage
-----

```npm install schema-couch -g```

From command-line

```schema-couch schemafolder http://admin:admin@localhost:5984/db```

In node

    var schema_couch = require('schema-couch');

    schema_couch(__dirname + '/schemas', 'http://admin:admin@localhost:5984/db', function(err){
        // hey, all done
    });


