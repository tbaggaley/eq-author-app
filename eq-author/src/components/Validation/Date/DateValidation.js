import Duration from "components/Validation/Date/Duration";
import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { get } from "lodash";

import { Input, Select } from "components/Forms";
import { Grid, Column } from "components/Grid";

import PreviousAnswerContentPicker from "components/Validation/PreviousAnswerContentPicker";
import MetadataContentPicker from "components/Validation/MetadataContentPicker";
import DisabledMessage from "components/Validation/DisabledMessage";
import { ValidationPills } from "components/Validation/ValidationPills";
import ValidationView from "components/Validation/ValidationView";
import Path from "components/Validation/path.svg?inline";
import PathEnd from "components/Validation/path-end.svg?inline";
import EmphasisedText from "components/Validation/Date/EmphasisedText";
import AlignedColumn from "components/Validation/Date/AlignedColumn";

import * as entityTypes from "constants/validation-entity-types";
import { DATE, DATE_RANGE } from "constants/answer-types";
import { DAYS, MONTHS, YEARS } from "constants/durations";

const UNITS = [DAYS, MONTHS, YEARS];
const RELATIVE_POSITIONS = ["Before", "After"];

const DateInput = styled(Input)`
  width: 12em;
  height: 2.25em;
`;

const ConnectedPath = styled(Path)`
  height: 3.6em;
`;

const RelativePositionSelect = styled(Select)`
  width: 6em;
`;

const StartDateText = styled.div`
  margin: 0;
  padding-top: 0.4em;
`;

const CustomInput = styled.div`
  margin-top: 5em;
`;

const START_COL_SIZE = 3;
const END_COL_SIZE = 12 - START_COL_SIZE;

const getUnits = ({ format, type }) => {
  if (type === DATE_RANGE) {
    return UNITS;
  }

  if (format === "dd/mm/yyyy") {
    return UNITS;
  }

  if (format === "mm/yyyy") {
    return UNITS.slice(1);
  }

  return UNITS.slice(2);
};

class DateValidation extends React.Component {
  PreviousAnswer = () => (
    <PreviousAnswerContentPicker
      answerId={this.props.answer.id}
      onSubmit={this.handleUpdate}
      selectedContentDisplayName={get(
        this.props.date.previousAnswer,
        "displayName"
      )}
      path={`answer.validation.${this.props.readKey}.availablePreviousAnswers`}
    />
  );

  Metadata = () => (
    <MetadataContentPicker
      answerId={this.props.answer.id}
      onSubmit={this.handleUpdate}
      selectedContentDisplayName={get(this.props.date.metadata, "displayName")}
      path={`answer.validation.${this.props.readKey}.availableMetadata`}
    />
  );

  Now = () => (
    <StartDateText>The date the respondent begins the survey</StartDateText>
  );

  Custom = () => (
    <DateInput
      name="customDate"
      type="date"
      value={this.props.date.customDate}
      onChange={this.props.onChange}
      onBlur={this.props.onUpdate}
      max="9999-12-30"
      min="1000-01-01"
    />
  );

  handleUpdate = update => this.props.onChange(update, this.props.onUpdate);

  handleEntityTypeChange = value =>
    this.handleUpdate({ name: "entityType", value });

  handleToggleChange = ({ value: enabled }) => {
    const {
      onToggleValidationRule,
      date: { id }
    } = this.props;

    onToggleValidationRule({
      id,
      enabled
    });
  };

  renderContent = () => {
    const {
      date: { offset, relativePosition, entityType },
      answer: {
        properties: { format },
        type
      },
      displayName,
      onChange,
      onUpdate
    } = this.props;

    const availableUnits = getUnits({ format, type });

    return (
      <div>
        <Grid>
          <AlignedColumn cols={START_COL_SIZE}>
            <EmphasisedText>{displayName} is</EmphasisedText>
          </AlignedColumn>
          <Column cols={END_COL_SIZE}>
            <Duration
              name="offset"
              duration={offset}
              units={availableUnits}
              onChange={onChange}
              onUpdate={onUpdate}
            />
          </Column>
        </Grid>
        <Grid>
          <Column cols={START_COL_SIZE}>
            <ConnectedPath />
          </Column>
        </Grid>
        <Grid>
          <AlignedColumn cols={START_COL_SIZE}>
            {type === DATE && (
              <RelativePositionSelect
                name="relativePosition"
                value={relativePosition}
                onChange={onChange}
                onBlur={onUpdate}
                data-test="relative-position-select"
              >
                {RELATIVE_POSITIONS.map(position => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </RelativePositionSelect>
            )}
            {type === DATE_RANGE && (
              <EmphasisedText>{relativePosition}</EmphasisedText>
            )}
            <PathEnd />
          </AlignedColumn>
          <Column cols={9}>
            {type === DATE && (
              <ValidationPills
                entityType={entityType}
                onEntityTypeChange={this.handleEntityTypeChange}
                PreviousAnswer={this.PreviousAnswer}
                Metadata={this.Metadata}
                Custom={this.Custom}
                Now={this.Now}
              />
            )}
            {type === DATE_RANGE && <CustomInput>{this.Custom()}</CustomInput>}
          </Column>
        </Grid>
      </div>
    );
  };

  renderDisabled = () => <DisabledMessage name={this.props.displayName} />;

  render() {
    const {
      testId,
      date: { enabled }
    } = this.props;

    return (
      <ValidationView
        data-test={testId}
        enabled={enabled}
        onToggleChange={this.handleToggleChange}
      >
        {enabled ? this.renderContent() : this.renderDisabled()}
      </ValidationView>
    );
  }
}

DateValidation.propTypes = {
  date: PropTypes.shape({
    id: PropTypes.string.isRequired,
    enabled: PropTypes.bool.isRequired,
    customDate: PropTypes.string,
    previousAnswer: PropTypes.shape({
      displayName: PropTypes.string.isRequired
    }),
    metadata: PropTypes.shape({
      displayName: PropTypes.string.isRequired
    }),
    offset: PropTypes.shape({
      unit: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired
    }).isRequired,
    relativePosition: PropTypes.string.isRequired,
    entityType: PropTypes.oneOf(Object.values(entityTypes)).isRequired
  }).isRequired,
  answer: PropTypes.shape({
    id: PropTypes.string.required,
    properties: PropTypes.shape({
      format: PropTypes.string
    }).isRequired
  }).isRequired,
  onToggleValidationRule: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  displayName: PropTypes.string.isRequired,
  readKey: PropTypes.string.isRequired,
  testId: PropTypes.string.isRequired
};

export default DateValidation;
