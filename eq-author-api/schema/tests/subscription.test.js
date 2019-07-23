const gql = require("graphql-tag");

const { NUMBER } = require("../../constants/answerTypes");

const { buildContext } = require("../../tests/utils/contextBuilder");
const executeSubscription = require("../../tests/utils/executeSubscription");

const {
  deleteQuestionnaire,
} = require("../../tests/utils/contextBuilder/questionnaire");
const {
  updateQuestionPage,
} = require("../../tests/utils/contextBuilder/page/questionPage");

const wait = timeout =>
  new Promise(resolve => setTimeout(() => resolve("timeout"), timeout));

describe("subscriptions", () => {
  let ctx, questionnaire, iterator;

  afterEach(async () => {
    await deleteQuestionnaire(ctx, questionnaire.id);
    iterator.return();
  });

  describe("validationUpdated", () => {
    beforeEach(async () => {
      ctx = await buildContext({
        sections: [
          {
            pages: [
              {
                title: "some value",
                answers: [
                  {
                    type: NUMBER,
                    label: "Some number",
                  },
                ],
              },
            ],
          },
        ],
      });
      questionnaire = ctx.questionnaire;
    });

    it("should update when something changes", async () => {
      const subscriptionQuery = gql`
        subscription Validation($id: ID!) {
          validationUpdated(id: $id) {
            id
            sections {
              id
              pages {
                id
                ... on QuestionPage {
                  validationErrorInfo {
                    totalCount
                  }
                }
              }
            }
          }
        }
      `;
      iterator = await executeSubscription(
        subscriptionQuery,
        {
          id: questionnaire.id,
        },
        {
          user: ctx.user,
        }
      );

      const pageId = questionnaire.sections[0].pages[0].id;
      await updateQuestionPage(ctx, {
        id: pageId,
        title: "",
      });
      const result = await iterator.next();

      const pageData = result.value.data.validationUpdated.sections[0].pages[0];

      expect(pageData).toMatchObject({
        id: pageId,
        validationErrorInfo: {
          totalCount: 1,
        },
      });
    });

    it("should not update if the subscribed query is not updated", async () => {
      const subscriptionQuery = gql`
        subscription Validation($id: ID!) {
          validationUpdated(id: $id) {
            id
            errorCount
            pages {
              id
              errorCount
            }
          }
        }
      `;
      const ctx2 = await buildContext({});
      iterator = await executeSubscription(
        subscriptionQuery,
        {
          id: ctx2.questionnaire.id,
        },
        {
          user: ctx2.user,
        }
      );

      const pageId = questionnaire.sections[0].pages[0].id;
      await updateQuestionPage(ctx, {
        id: pageId,
        title: "",
      });
      const p = iterator.next();
      const result = await Promise.race([p, wait(50)]);
      expect(result).toBe("timeout");
    });

    it("should not receive updates when the user does not have read permissions", async () => {
      const subscriptionQuery = gql`
        subscription Validation($id: ID!) {
          validationUpdated(id: $id) {
            id
            errorCount
            pages {
              id
              errorCount
            }
          }
        }
      `;
      const ctx2 = await buildContext({
        isPublic: false,
        sections: [{ pages: [{}] }],
      });
      iterator = await executeSubscription(
        subscriptionQuery,
        {
          id: ctx2.questionnaire.id,
        },
        {
          user: ctx.user,
        }
      );
      const pageId = ctx2.questionnaire.sections[0].pages[0].id;
      await updateQuestionPage(ctx2, {
        id: pageId,
        title: "",
      });

      const p = iterator.next();
      const result = await Promise.race([p, wait(50)]);
      expect(result).toBe("timeout");
    });
  });
});
