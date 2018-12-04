const db = require("../db");
const buildTestQuestionnaire = require("../tests/utils/buildTestQuestionnaire")(
  db
);
const DestinationRepository = require("./DestinationRepository")(db);

const RoutingRule2Repository = require("./RoutingRule2Repository")(db);

describe("Routing Rule 2 Repository", () => {
  beforeAll(() => db.migrate.latest());
  afterAll(() => db.destroy());

  afterEach(async () => {
    await db.transaction(async trx => {
      await trx.table("Questionnaires").delete();
    });
  });

  let routing;
  beforeEach(async () => {
    const questionnaire = await buildTestQuestionnaire({
      sections: [
        {
          pages: [
            {
              routing: {
                else: {
                  logical: "NextPage"
                }
              }
            }
          ]
        }
      ]
    });
    routing = questionnaire.sections[0].pages[0].routing;
  });

  describe("insert", () => {
    let destination;
    beforeEach(async () => {
      destination = await DestinationRepository.insert();
    });

    it("should create a routing rule", async () => {
      const routingRule = await RoutingRule2Repository.insert({
        routingId: routing.id,
        destinationId: destination.id
      });

      expect(routingRule).toMatchObject({
        id: expect.any(Number),
        routingId: routing.id,
        destinationId: destination.id
      });
    });
  });

  describe("getByRoutingId", () => {
    it("should retrieve all rules for a routing", async () => {
      const destination1 = await DestinationRepository.insert();
      const routingRule1 = await RoutingRule2Repository.insert({
        routingId: routing.id,
        destinationId: destination1.id
      });
      const destination2 = await DestinationRepository.insert();
      const routingRule2 = await RoutingRule2Repository.insert({
        routingId: routing.id,
        destinationId: destination2.id
      });

      const rules = await RoutingRule2Repository.getByRoutingId(routing.id);

      expect(rules).toEqual([
        expect.objectContaining({
          id: routingRule1.id,
          routingId: routing.id,
          destinationId: destination1.id
        }),
        expect.objectContaining({
          id: routingRule2.id,
          routingId: routing.id,
          destinationId: destination2.id
        })
      ]);
    });
  });

  describe("getById", () => {
    it("should return the rule for the id", async () => {
      const destination = await DestinationRepository.insert();
      const rule = await RoutingRule2Repository.insert({
        routingId: routing.id,
        destinationId: destination.id
      });

      const readRule = await RoutingRule2Repository.getById(rule.id);

      expect(readRule).toMatchObject(rule);
    });
  });
});
