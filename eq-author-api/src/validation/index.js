const Ajv = require("ajv");
const createValidationError = require("./createValidationError");

const schemas = require("./schemas");

const ajv = new Ajv({ allErrors: true, jsonPointers: true, $data: true });

require("ajv-errors")(ajv);
require("./customKeywords")(ajv);
require("ajv-keywords")(ajv, "select");

const validate = ajv.addSchema(schemas.slice(1)).compile(schemas[0]);

const formatErrorMessage = (error, questionnaire) => {
  if (error.sectionId) {
    delete error.dataPath;
    delete error.schemaPath;
    delete error.keyword;

    return error;
  }

  const { dataPath, message } = error;

  const splitDataPath = dataPath.split("/");
  const field =
    message === "ERR_QCODE_REQUIRED"
      ? "qCode"
      : message === "ERR_SECONDARY_QCODE_REQUIRED"
      ? "secondaryQCode"
      : splitDataPath.pop();

  const newErrorMessage = createValidationError(
    splitDataPath,
    field,
    message,
    questionnaire
  );

  delete newErrorMessage.keyword;
  return newErrorMessage;
};

module.exports = questionnaire => {
  validate(questionnaire);

  if (!validate.errors) {
    return [];
  }

  const uniqueErrorMessages = {};
  const formattedErrorMessages = [];

  for (const err of validate.errors) {
    if (err.keyword === "errorMessage") {
      const key = `${err.dataPath} ${err.message}`;

      if (uniqueErrorMessages[key]) {
        continue;
      }
      uniqueErrorMessages[key] = err;

      formattedErrorMessages.push(formatErrorMessage(err, questionnaire));
    }
  }

  return formattedErrorMessages;
};
