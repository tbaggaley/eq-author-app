const { findIndex, merge, uniq, get, intersection } = require("lodash");

const { getName } = require("../../../utils/getName");
const getPreviousAnswersForPage = require("../../../src/businessLogic/getPreviousAnswersForPage");

const {
  NUMBER,
  CURRENCY,
  PERCENTAGE,
  UNIT,
} = require("../../../constants/answerTypes");

const { createMutation } = require("../createMutation");
const {
  getPageById,
  getAnswerById,
  getFolderById,
  getFoldersBySectionId,
  getSectionByPageId,
  getPagesFromSection,
  createCalculatedSummary,
  returnValidationErrors,
  createFolder,
  getPosition,
} = require("../utils");

const Resolvers = {};

Resolvers.CalculatedSummaryPage = {
  displayName: page => getName(page, "CalculatedSummaryPage"),
  section: ({ id }, input, ctx) => getSectionByPageId(ctx, id),
  position: ({ id }, args, ctx) => {
    const section = getSectionByPageId(ctx, id);
    // will need to check this
    return findIndex(getPagesFromSection(section), { id });
  },
  summaryAnswers: ({ id, summaryAnswers }, args, ctx) => {
    const section = getSectionByPageId(ctx, id);
    const previousAnswers = getPreviousAnswersForPage(
      { sections: [section] },
      id,
      true,
      [NUMBER, CURRENCY, PERCENTAGE, UNIT]
    ).map(({ id }) => id);
    const validSummaryAnswers = intersection(previousAnswers, summaryAnswers);
    return validSummaryAnswers
      ? validSummaryAnswers.map(validSummaryAnswer =>
        getAnswerById(ctx, validSummaryAnswer)
      )
      : [];
  },

  availableSummaryAnswers: ({ id }, args, ctx) => {
    const section = getSectionByPageId(ctx, id);

    return getPreviousAnswersForPage({ sections: [section] }, id, true, [
      NUMBER,
      CURRENCY,
      PERCENTAGE,
      UNIT,
    ]);
  },
  availablePipingAnswers: ({ id }, args, ctx) =>
    getPreviousAnswersForPage(ctx.questionnaire, id),
  availablePipingMetadata: (page, args, ctx) => ctx.questionnaire.metadata,
  validationErrorInfo: ({ id }, args, ctx) => {
    const calculatedSummaryErrors = ctx.validationErrorInfo.filter(
      ({ pageId }) => id === pageId
    );

    return ({
      id,
      errors: calculatedSummaryErrors,
      totalCount: calculatedSummaryErrors.length,
    });
  },
};

Resolvers.Mutation = {
  createCalculatedSummaryPage: createMutation(
    (root, { input: { position, sectionId, folderId } }, ctx) => {
      const page = createCalculatedSummary({ sectionId });
      if (folderId) {
        const folder = getFolderById(ctx, folderId);
        folder.pages.splice(getPosition(position, folder.pages), 0, page);
      } else {
        const folders = getFoldersBySectionId(ctx, sectionId);
        const folder = createFolder({
          pages: [page],
        });
        folders.push(folder);
      }
      return page;
    }
  ),
  updateCalculatedSummaryPage: createMutation((_, { input }, ctx) => {
    const page = getPageById(ctx, input.id);
    if (get(input, "summaryAnswers", []).length > 0) {
      const answerTypes = input.summaryAnswers.map(summaryAnswerId => {
        const answerType = getAnswerById(ctx, summaryAnswerId).type;
        if (![NUMBER, CURRENCY, PERCENTAGE, UNIT].includes(answerType)) {
          throw new Error(
            `${answerType} answers are not suitable for a calculated summary page`
          );
        }
        return answerType;
      });
      if (uniq(answerTypes).length > 1) {
        throw new Error(
          "Answer types must be consistent on a calculated summary"
        );
      }
    }

    merge(page, input);
    page.summaryAnswers = input.summaryAnswers;
    return page;
  }),
};

module.exports = { Resolvers, createCalculatedSummary };
