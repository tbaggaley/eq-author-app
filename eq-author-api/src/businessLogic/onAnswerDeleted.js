const { flatMap, filter, forEach, uniq } = require("lodash/fp");

const {
  SELECTED_ANSWER_DELETED,
} = require("../../constants/routingNoLeftSide");
const { NULL } = require("../../constants/routingNoLeftSide");
const totalableAnswerTypes = require("../../constants/totalableAnswerTypes");
const createGroupValidation = require("./createTotalValidation");
const { getPages } = require("../../schema/resolvers/utils");

const removeAnswerFromExpressions = (ctx, answer) => {
  const allPages = getPages(ctx);

  allPages.forEach(page => {
    if (page.routing) {
      const expressions = filter(
        expression => expression.left.answerId === answer.id,
        flatMap(rule => rule.expressionGroup.expressions, page.routing.rules)
      );

      forEach(expression => {
        expression.left.answerId = undefined;
        expression.left.type = NULL;
        expression.left.nullReason = SELECTED_ANSWER_DELETED;
      }, expressions);
    }
  });
};

const removeAnswerGroup = (page, removedAnswer) => {
  const answerTypes = uniq(page.answers.map(a => a.type));
  const firstAnswerType = answerTypes[0];
  if (
    answerTypes.length === 1 &&
    page.answers.length > 1 &&
    totalableAnswerTypes.includes(firstAnswerType)
  ) {
    page.totalValidation = createGroupValidation();
    return;
  }

  if (!totalableAnswerTypes.includes(removedAnswer.type)) {
    return;
  }

  const numberOfType = page.answers.filter(
    answer => answer.type === removedAnswer.type
  ).length;
  if (numberOfType !== 1) {
    return;
  }

  page.totalValidation = null;
};

module.exports = (ctx, page, answer) => {
  removeAnswerFromExpressions(ctx, answer);
  removeAnswerGroup(page, answer);
};
