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
