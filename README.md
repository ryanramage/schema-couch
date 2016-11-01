schema-couch
=============

Yes, yes, couchdb is schemaless, but sometimes, it is really nice to have a some 'typed' json docs.

schema-couch takes a directory full of schemas, and creates a couchdb design-doc that helps you with
doc manipulation, queries and relationships based on those schemas. Validation, navigation, a decent api, all in a
very minimal package.

## Usage

`npm install schema-couch -g`

*From command-line*

`schema-couch schemafolder http://admin:admin@localhost:5984/db`

*In node.js*

`npm install schema-couch --save`

To install from this branch: `npm install kristianmandrup/schema-couch#master --save`

```js
var schemaCouch = require('schema-couch');
var schemaPath= path.join(__dirname, '/schemas')
var dbUri = 'http://admin:admin@localhost:5984/db';

schemaCouch(schemaPath, dbUri, function(err) {
    if (err) {
        console.error(err);
        return false;
    }
    console.log('Schemas added :)');
});
```

As the schemas are loaded and added there 3 phases, each with a callback hook:

- `loaded`
- `pushed`
- `complete`

You can customize the `onComplete` handler by implemeting this signature.
See the `create-app/create-on-complete` for the default onComplete factory function, to use as an example and inspiration.

```function(dbPath, webapp, callbacks) {
  return function(err, final_doc) {
    /// ... custom handler here ...
  }
}
```

Full customized callbacks example:

```js
schemaCouch(schemaPath, dbUri, {
    onPushed: myOnPushed,
    onLoaded: myOnLoaded,
    createOnComplete: myCreateOnComplete
});
```

## Schema examples

### Schema: quiz.js

- `has_many`:
    - `submissions`, type `submission` (see schema below).
    - `related`, type `quiz`
    - `subquestions`, type `quiz`

```js
module.exports = {
    type: "object",
    list: {
        filters: {
            category: ["category", "difficulty"],
            difficulty: ["difficulty"]
        },
        value: { question: "question" }
    },
    has_many: [
        { name: 'submissions',  type: 'submission' },
        { name: 'related',      type: 'quiz'      },
        { name: 'subquestions', type: 'quiz'      }
    ],
    belongs_to: [
      {
        name: 'related_from',
        type: 'quiz',
        many_name: 'related',
        foreign_key: '.related',
        filters: {
            category: ["category", "difficulty"],
            difficulty: ["difficulty"]
        },
        value: { question: "question" }
      },
      {
        name: 'parent_quiz',
        type: 'quiz',
        many_name: 'subquestions',
        foreign_key: 'parent_question_id',
        filters: {
            category: ["category", "difficulty"],
            difficulty: ["difficulty"]
        },
        value: { question: "question" }
      }
    ],
    properties: {
        question: {
            type: "string",
            required: true
        },
        parent_question_id: {
          type: "string"
        },
        related: {
            type: "array",
            items: {
                type: "string"
            }
        },
        choices: {
            type: "object",
            required: true,
            additionalProperties: false,
            properties: {
                a: {
                    type: "string",
                    required: true
                },
                b: {
                    type: "string",
                    required: true
                },
                c: {
                    type: "string"
                },
                d: {
                    type: "string"
                }
            }
        },
        answers: {
            type: "array",
            required: true,
            minItems: 1,
            maxItems: 4,
            items: {
                type: "string"
            }
        },
        category: {
            type: "string",
            required: true
        },
        difficulty: {
            type: "integer",
            required: true,
            minimum: 0,
            maximum: 10
        }
    }
}
```

### Schema: submission.js

`belongs_to`:
    - `quiz`, type `quiz` (see schema above)

```js
module.exports = {
    type: "object",
    additionalProperties: false,
    belongs_to: [
      {
        name: "quiz",
        type: "quiz",
        many_name: "submissions",
        foreign_key: "question_id",
        extra_keys: ["answer"]
      },
      {
        type: "user",
        many_name: "answers",
        foreign_key: "user_id"
      }
    ],
    properties: {
        answer: {
            type: "string",
            required: true
        },
        question_id: {
          type: "string",
          required: true
        },
        user_id: {
          type: "string",
          required: true
        }

    }
}
```

Relationships
-------------

As you can see in the example schemas, some additional (non-standard) properties are used to describe relationships between schemas.
Also, a way to create filters of lists, and values that appear in lists.

API
---

Here are some examples of the api created by the example.

```bash
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
```
