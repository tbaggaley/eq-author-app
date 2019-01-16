/* eslint-disable camelcase */
const knex = require("knex")(require("../knexfile"));
const answerTypes = require("../constants/answerTypes");
const metadataTypes = require("../constants/metadataTypes");

const buildTestQuestionnaire = require("../tests/utils/buildTestQuestionnaire")(
  knex
);
const QuestionConfirmationRepository = require("./QuestionConfirmationRepository")(
  knex
);

describe("QuestionConfirmationRepository", () => {
  let page;
  let questionnaire;
  beforeAll(async () => {
    await knex.migrate.latest();
    questionnaire = await buildTestQuestionnaire({
      metadata: [
        {
          key: "date",
          alias: "Date",
          type: metadataTypes.DATE,
        },
      ],
      sections: [
        {
          pages: [
            {
              answers: [
                {
                  label: "Previous Currency Answer",
                  type: answerTypes.CURRENCY,
                },
                {
                  label: "Previous Date Answer",
                  type: answerTypes.DATE,
                },
                {
                  label: "Previous Date Range Answer",
                  type: answerTypes.DATE_RANGE,
                },
              ],
            },
            {
              answers: [
                {
                  label: "Answer",
                  type: answerTypes.TEXTFIELD,
                },
              ],
            },
          ],
        },
      ],
    });
    page = questionnaire.sections[0].pages[1];
  });
  afterEach(() => knex("QuestionConfirmations").delete());

  describe("create", () => {
    it("should create and return the confirmation", async () => {
      const confirmation = await QuestionConfirmationRepository.create({
        pageId: page.id,
      });
      expect(confirmation).toMatchObject({
        id: expect.any(Number),
        title: null,
        pageId: page.id,
        positiveLabel: null,
        positiveDescription: null,
        negativeLabel: null,
        negativeDescription: null,
        isDeleted: false,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
    });

    it("should not allow you to create a confirmation for a question if one already exists", async () => {
      await QuestionConfirmationRepository.create({
        pageId: page.id,
      });
      let thrown = false;
      try {
        await QuestionConfirmationRepository.create({
          pageId: page.id,
        });
      } catch (e) {
        thrown = e;
      }
      expect(thrown).toBeTruthy();
      expect(thrown.message).toMatch(/Cannot create a question confirmation/);
    });
  });

  describe("read", () => {
    let confirmation;
    beforeEach(async () => {
      confirmation = await QuestionConfirmationRepository.create({
        pageId: page.id,
      });
    });

    describe("findById", () => {
      it("should find the confirmation by id", async () => {
        const foundConfirmation = await QuestionConfirmationRepository.findById(
          confirmation.id.toString()
        );
        expect(foundConfirmation).toMatchObject(confirmation);
      });
    });

    describe("findByPageId", () => {
      it("should find the confirmation for the page", async () => {
        const foundConfirmation = await QuestionConfirmationRepository.findByPageId(
          page.id.toString()
        );
        expect(foundConfirmation).toMatchObject(confirmation);
      });
    });
  });

  describe("update", () => {
    let confirmation;
    beforeEach(async () => {
      confirmation = await QuestionConfirmationRepository.create({
        pageId: page.id,
      });
    });

    it("should save the values and return the updated object", async () => {
      const updatedConfirmation = await QuestionConfirmationRepository.update({
        id: confirmation.id,
        title: "My title",
        positiveDescription: "Positivity flows",
        negativeLabel: "Negativity grows",
      });

      const foundConfirmation = await QuestionConfirmationRepository.findById(
        confirmation.id.toString()
      );

      expect(updatedConfirmation).toMatchObject({
        id: confirmation.id,
        title: "My title",
        positiveDescription: "Positivity flows",
        negativeLabel: "Negativity grows",
      });
      expect(updatedConfirmation).toMatchObject(foundConfirmation);
    });

    it("should not be possible to update isDeleted or pageId directly", async () => {
      const updatedConfirmation = await QuestionConfirmationRepository.update({
        id: confirmation.id,
        title: "My title",
        isDeleted: true,
        pageId: 2,
      });

      expect(updatedConfirmation).toMatchObject({
        ...confirmation,
        title: "My title",
        isDeleted: false,
        pageId: page.id,
      });
    });
  });

  describe("delete", () => {
    let confirmation;
    beforeEach(async () => {
      confirmation = await QuestionConfirmationRepository.create({
        pageId: page.id,
      });
    });

    it("should delete the confirmation and return existing values", async () => {
      const deletedConfirmation = await QuestionConfirmationRepository.delete(
        confirmation
      );
      expect(deletedConfirmation).toMatchObject({
        ...confirmation,
        isDeleted: true,
      });
    });

    it("should not be possible to read a deleted confirmation", async () => {
      await QuestionConfirmationRepository.delete(confirmation);
      const readConfirmation = await QuestionConfirmationRepository.findById(
        confirmation.id
      );
      expect(readConfirmation).toBeUndefined();

      const readByPage = await QuestionConfirmationRepository.findByPageId(
        page.id
      );
      expect(readByPage).toBeUndefined();
    });
  });

  describe("restore", () => {
    let confirmation;
    beforeEach(async () => {
      confirmation = await QuestionConfirmationRepository.create({
        pageId: page.id,
      });
      await QuestionConfirmationRepository.delete(confirmation);
    });

    it("should restore a deleted confirmation", async () => {
      await QuestionConfirmationRepository.restore(confirmation.id);
      const readConfirmation = await QuestionConfirmationRepository.findById(
        confirmation.id
      );
      expect(readConfirmation).toMatchObject({
        id: confirmation.id,
        isDeleted: false,
      });
    });

    it("should delete all those linked to the page for the restored confirmation", async () => {
      const newConfirmation = await QuestionConfirmationRepository.create({
        pageId: page.id,
      });
      await QuestionConfirmationRepository.restore(confirmation.id);

      const readNewConfirmation = await QuestionConfirmationRepository.findById(
        newConfirmation.id
      );
      expect(readNewConfirmation).toBeUndefined();

      const readByPage = await QuestionConfirmationRepository.findByPageId(
        page.id
      );
      expect(readByPage).toEqual(confirmation);
    });
  });

  describe("getPipingAnswers", () => {
    it("should return the answers on the page and previous pages", async () => {
      const confirmation = await QuestionConfirmationRepository.create({
        pageId: page.id,
      });

      const pipingAnswers = await QuestionConfirmationRepository.getPipingAnswers(
        confirmation.id
      );
      expect(pipingAnswers).toEqual([
        expect.objectContaining({ label: "Previous Currency Answer" }),
        expect.objectContaining({ label: "Previous Date Answer" }),
        expect.objectContaining({ label: "Previous Date Range Answer" }),
        expect.objectContaining({ label: "Answer" }),
      ]);
    });
  });

  describe("getPipingMetadata", () => {
    it("should return the available metadata", async () => {
      const confirmation = await QuestionConfirmationRepository.create({
        pageId: page.id,
      });

      const pipingMetadata = await QuestionConfirmationRepository.getPipingMetadata(
        confirmation.id
      );
      expect(pipingMetadata).toEqual([
        expect.objectContaining({ key: "date", alias: "Date" }),
      ]);
    });
  });
});
