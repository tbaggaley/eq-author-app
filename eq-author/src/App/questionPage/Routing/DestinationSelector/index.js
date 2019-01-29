import React from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";
import CustomPropTypes from "custom-prop-types";
import { Grid, Column } from "components/Grid";
import PropTypes from "prop-types";

import RoutingDestinationContentPicker from "./RoutingDestinationContentPicker";

const RoutingRuleResult = styled.div`
  padding: 1em 1em 1em 0.7em;
`;

const Label = styled.label`
  width: 100%;
  display: block;
  font-size: 0.9em;
  font-weight: bold;
  &[disabled] {
    opacity: 0.5;
  }
`;

const Goto = styled.span`
  float: right;
  margin-right: 1em;
`;

export class UnwrappedDestinationSelector extends React.Component {
  handleChange = ({ value: { __typename: type, id } }) => {
    let destination;
    if (type === "Section") {
      destination = {
        sectionId: id,
      };
    } else if (type === "QuestionPage") {
      destination = {
        pageId: id,
      };
    } else {
      destination = {
        logical: id,
      };
    }

    this.props.onChange(destination);
  };

  render() {
    const { label, id, disabled, value } = this.props;
    return (
      <RoutingRuleResult key={id}>
        <Grid align="center">
          <Column gutters={false} cols={5}>
            <Label htmlFor={id} disabled={disabled}>
              {label} <Goto>Go to: </Goto>
            </Label>
          </Column>
          <Column gutters={false} cols={7}>
            <RoutingDestinationContentPicker
              id={id}
              pageId={this.props.match.params.pageId}
              selected={value}
              onSubmit={this.handleChange}
              disabled={disabled}
              data-test="routing-destination-content-picker"
            />
          </Column>
        </Grid>
      </RoutingRuleResult>
    );
  }
}

UnwrappedDestinationSelector.propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  disabled: PropTypes.bool.isRequired,
  match: CustomPropTypes.match,
};

UnwrappedDestinationSelector.defaultProps = {
  disabled: false,
  loading: false,
};

export default withRouter(UnwrappedDestinationSelector);
