module.exports = {
    type: "object",
    additionalProperties: false,
    belongs_to: [
      { parent: "question_id", type: "quiz", key:["answer"]},
      { parent: "user_id", type: "user" }
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
