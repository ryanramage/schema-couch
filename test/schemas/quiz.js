module.exports = {
    type: "object",
    additionalProperties: false,
    list_by_type: {
        key: ["category", "difficulty"],
        value: { question: "question" }
    },
    has_many: [
        { name: 'submissions', type: 'submission' },
        { name: 'difficulty_subquestions', type: 'quiz', relation: 'difficulty' },
        { name: 'category_subquestions',   type: 'quiz', relation: 'category'   }
    ],
    belongs_to: [
      { parent: "parent_question_id", type: 'quiz', relation: "difficulty", key: ["difficulty"], value: { question: "question"  }},
      { parent: "parent_question_id", type: 'quiz', relation: "category",   key: ["category"]  }
    ],
    properties: {
        question: {
            type: "string",
            required: true
        },
        parent_question_id: {
          type: "string"
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
