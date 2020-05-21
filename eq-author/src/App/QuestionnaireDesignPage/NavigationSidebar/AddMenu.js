import React from "react";
import PropTypes from "prop-types";

import styled from "styled-components";
import Button from "components/buttons/Button";
import Popout, { Container, Layer } from "components/Popout";
import IconPlus from "./icon-plus.svg?inline";
import IconSection from "./icon-section.svg?inline";
import IconQuestion from "./icon-questionpage.svg?inline";
import IconSummary from "./icon-summarypage.svg?inline";
import IconConfirmation from "./icon-playback.svg?inline";

import IconText from "components/IconText";
import { radius, colors } from "constants/theme";
import { lighten } from "polished";

import PopupTransition from "./PopupTransition";

const AddMenuWindow = styled.div`
  background: white;
  color: black;
  background-color: white;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const AddMenuButton = styled(Button).attrs({
  variant: "nav-addMenu",
  medium: true,
})`
  justify-content: left;
  font-size: 0.9em;
  padding: 0.2em 1.6em;
  white-space: nowrap;

  &[disabled] {
    span {
      svg {
        path {
          fill: ${lighten(0.4, colors.darkerBlack)};
        }
      }
    }
  }
`;

const AddButton = styled(Button).attrs({
  variant: "nav-header",
  medium: true,
})`
  width: 100%;
  padding: 0.7em 1.8em;
  z-index: 15;
`;

const StyledIconText = styled(IconText)`
  justify-content: flex-start;

  svg {
    margin-right: 1em;
    path {
      fill: ${colors.black};
    }
  }
`;

const StyledIconTextAdd = styled(IconText)`
  justify-content: flex-start;

  svg {
    background-color: ${colors.orange};
    border-radius: ${radius};
    margin-right: 1em;
    flex: inherit;
    width: 22px;
    height: 22px;
    path {
      fill: ${colors.darkGrey};
    }
  }
`;

const PopoutContainer = styled(Container)`
  width: 100%;
`;

const PopoutLayer = styled(Layer)`
  left: auto;
  top: auto;
  width: 100%;
`;

const AddMenu = ({
  addMenuOpen,
  onAddMenuToggle,
  onAddQuestionPage,
  canAddQuestionPage,
  onAddSection,
  onAddCalculatedSummaryPage,
  canAddCalculatedSummaryPage,
  onAddQuestionConfirmation,
  canAddQuestionConfirmation,
  ...otherProps
}) => {
  const addBtn = (
    <AddButton data-test="btn-add">
      <StyledIconTextAdd icon={IconPlus}>Add content</StyledIconTextAdd>
    </AddButton>
  );
  return (
    <div {...otherProps}>
      <Popout
        open={addMenuOpen}
        trigger={addBtn}
        onToggleOpen={onAddMenuToggle}
        horizontalAlignment="left"
        verticalAlignment="top"
        transition={PopupTransition}
        container={PopoutContainer}
        layer={PopoutLayer}
      >
        <AddMenuWindow data-test="addmenu-window">
          <AddMenuButton
            primary
            onClick={onAddQuestionPage}
            data-test="btn-add-question-page"
            disabled={!canAddQuestionPage}
          >
            <StyledIconText icon={IconQuestion}>Question page</StyledIconText>
          </AddMenuButton>
          <AddMenuButton
            primary
            data-test="btn-add-question-confirmation"
            onClick={onAddQuestionConfirmation}
            disabled={!canAddQuestionConfirmation}
          >
            <StyledIconText icon={IconConfirmation}>
              Confirmation question
            </StyledIconText>
          </AddMenuButton>
          <AddMenuButton
            primary
            onClick={onAddCalculatedSummaryPage}
            data-test="btn-add-calculated-summary"
            disabled={!canAddCalculatedSummaryPage}
          >
            <StyledIconText icon={IconSummary}>
              Calculated summary
            </StyledIconText>
          </AddMenuButton>
          <AddMenuButton
            primary
            onClick={onAddSection}
            data-test="btn-add-section"
          >
            <StyledIconText icon={IconSection}>Section</StyledIconText>
          </AddMenuButton>
        </AddMenuWindow>
      </Popout>
    </div>
  );
};

AddMenu.propTypes = {
  onAddMenuToggle: PropTypes.func.isRequired,
  onAddQuestionPage: PropTypes.func.isRequired,
  canAddQuestionPage: PropTypes.bool.isRequired,
  onAddSection: PropTypes.func.isRequired,
  onAddQuestionConfirmation: PropTypes.func.isRequired,
  canAddQuestionConfirmation: PropTypes.bool.isRequired,
  onAddCalculatedSummaryPage: PropTypes.func.isRequired,
  canAddCalculatedSummaryPage: PropTypes.bool.isRequired,
  addMenuOpen: PropTypes.bool.isRequired,
};

export default AddMenu;
