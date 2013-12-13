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
