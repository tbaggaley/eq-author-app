import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import { colors, radius } from "constants/theme";

const Definition = styled.div`
  border: 1px solid ${colors.bordersLight};
  position: relative;
  margin-bottom: 2em;
  border-radius: ${radius};

  &:focus-within {
    border-color: ${colors.blue};
    box-shadow: 0 0 0 1px ${colors.blue};
  }
`;

const DefinitionLabel = styled.div`
  color: ${colors.darkGrey};
  font-weight: bold;
  margin-bottom: 0.5em;
`;

const Padding = styled.div`
  padding: 1.5em 1.5em 0;
`;

const DefinitionEditor = ({ label, children }) => (
  <>
    <DefinitionLabel>{label}</DefinitionLabel>
    <Definition>
      <Padding>{children}</Padding>
    </Definition>
  </>
);

DefinitionEditor.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default DefinitionEditor;
