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


Example
-------

See the example in the exmaple directory

```node example/test.js```

After it uploads, use futon to create a new doc, like:

    {
      type: "quiz"
    }

And keep trying to save. The error messages will hopefully guide you.

Relationships
-------------

As you can see in the example schemas, some additional (non-standard) properties are used to describe
relationships between schemas. Also, a way to create filters of lists, and values that appear in lists.
More information will come later as we/you experiment. Feedback welcome.

API
---

Here are some examples of the api created by the example.

    /_design/schema/_rewrite/ -> list all types
    /_design/schema/_rewrite/quiz  -> list all quizes
    /_design/schema/_rewrite/quiz/schema -> the quiz schema
    /_design/schema/_rewrite/quiz/filters -> [category,difficulty], filters you can user
    /_design/schema/_rewrite/quiz/filters/category -> list quiz category counts (where category is in quiz.list.filters)
    /_design/schema/_rewrite/quiz/filters/category/film -> first level filter
    /_design/schema/_rewrite/quiz/filters/catagory/film/5 -> second level filter
    /_design/schema/_rewrite/quiz/id/6366d891e7a1f90bc1092577d6093fa5 -> quiz document
    /_design/schema/_rewrite/quiz/id/6366d891e7a1f90bc1092577d6093fa5/has_many -> [submissions, related, subquestions] list the types of children
    /_design/schema/_rewrite/quiz/id/6366d891e7a1f90bc1092577d6093fa5/has_many/submissions -> list related submissions
    /_design/schema/_rewrite/quiz/id/6366d891e7a1f90bc1092577d6093fa5/has_many/submissions/filters -> []
    /_design/schema/_rewrite/quiz/id/6366d891e7a1f90bc1092577d6093fa5/has_many/related/filters -> [category, difficulty]
    /_design/schema/_rewrite/quiz/id/6366d891e7a1f90bc1092577d6093fa5/has_many/subquestions/filters -> [category, difficulty]
    /_design/schema/_rewrite/quiz/id/6366d891e7a1f90bc1092577d6093fa5/has_many/subquestions/filters/category -> list quiz category counts
    /_design/schema/_rewrite/quiz/id/6366d891e7a1f90bc1092577d6093fa5/has_many/subquestions/filters/category/film ->
    /_design/schema/_rewrite/quiz/id/6366d891e7a1f90bc1092577d6093fa5/belongs_to -> [related_from, parent_quiz]
    /_design/schema/_rewrite/quiz/id/6366d891e7a1f90bc1092577d6093fa5/belongs_to/related_from -> many docs?
    /_design/schema/_rewrite/quiz/id/6366d891e7a1f90bc1092577d6093fa5/belongs_to/parent_quiz -> one doc
    /_design/schema/_rewrite/submission -> list all submissions
    /_design/schema/_rewrite/submission/filters -> []
    /_design/schema/_rewrite/submission/6366d891e7a1f90bc1092577d608be94/has_many -> []
    /_design/schema/_rewrite/submission/6366d891e7a1f90bc1092577d608be94/belongs_to -> [quiz, user]
    /_design/schema/_rewrite/submission/6366d891e7a1f90bc1092577d608be94/belongs_to/quiz -> one doc
    /_design/schema/_rewrite/submission/6366d891e7a1f90bc1092577d608be94/belongs_to/user -> one doc







