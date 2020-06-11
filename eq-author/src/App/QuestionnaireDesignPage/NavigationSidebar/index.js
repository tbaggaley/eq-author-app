import React, { useReducer, useCallback } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import CustomPropTypes from "custom-prop-types";
import gql from "graphql-tag";

import { colors } from "constants/theme";
import { flowRight } from "lodash";
import { withRouter } from "react-router-dom";

import SectionNav from "./SectionNav";
import NavigationHeader from "./NavigationHeader";
import IntroductionNavItem from "./IntroductionNavItem";

import Button from "components/buttons/Button";
import ScrollPane from "components/ScrollPane";

const Container = styled.div`
  background: ${colors.black};
  color: ${colors.white};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const NavigationScrollPane = styled(ScrollPane)`
  float: left;
  &:hover {
    &::-webkit-scrollbar-thumb {
      background: ${colors.lightGrey};
    }
  }
`;

const NavList = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const AccordionGroupToggle = styled(Button).attrs({
  variant: "tertiary-light",
  small: true,
})`
  margin: 0.425em 0 0.425em 1.8em;
  border: 1px solid white;
  top: 1px; /* adjust for misalignment caused by PopoutContainer */
  padding: 0.5em;
  align-self: baseline;
`;

const proptypes = {
  UnwrappedNavigationSidebar: {
    questionnaire: CustomPropTypes.questionnaire,
    onAddQuestionPage: PropTypes.func.isRequired,
    onAddCalculatedSummaryPage: PropTypes.func.isRequired,
    onAddSection: PropTypes.func.isRequired,
    onAddQuestionConfirmation: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    canAddQuestionConfirmation: PropTypes.bool.isRequired,
    canAddCalculatedSummaryPage: PropTypes.bool.isRequired,
    canAddQuestionPage: PropTypes.bool.isRequired,
  },
};

const initialState = { label: true, isOpen: { open: true } };

export const actionTypes = {
  toggleLabel: "toggleLabel",
  handleClick: "handleClick",
};

export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.toggleLabel: {
      return { ...state, label: !state.label };
    }
    case actionTypes.handleClick: {
      const toOpen = !state.label ? { open: true } : { open: false };
      return { label: !state.label, isOpen: toOpen };
    }
    default:
      throw new Error(`${action.type} is not a valid dispatch type`);
  }
};

export const UnwrappedNavigationSidebar = props => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    questionnaire,
    onAddQuestionPage,
    onAddSection,
    onAddCalculatedSummaryPage,
    onAddQuestionConfirmation,
    canAddQuestionConfirmation,
    canAddCalculatedSummaryPage,
    canAddQuestionPage,
    loading,
  } = props;

  const { label, isOpen } = state;

  const handleAddSection = useCallback(() => {
    onAddSection(questionnaire.id);
  }, [questionnaire]);

  const handleClick = () => {
    dispatch({ type: actionTypes.handleClick });
  };

  const handleAccordionChange = event => {
    const allOpen = questionnaire.sections
      .map((item, index) => ({
        isOpen: true,
        id: index,
      }))
      .filter(item => item.id !== event.id)
      .concat(event)
      .every(item => item.isOpen === true);

    if (allOpen !== state.label) {
      dispatch({
        type: actionTypes.toggleLabel,
      });
    }
  };

  return (
    <Container data-test="side-nav">
      {loading ? null : (
        <>
          <NavigationHeader
            questionnaire={questionnaire}
            onAddSection={handleAddSection}
            onAddCalculatedSummaryPage={onAddCalculatedSummaryPage}
            canAddCalculatedSummaryPage={canAddCalculatedSummaryPage}
            onAddQuestionPage={onAddQuestionPage}
            canAddQuestionPage={canAddQuestionPage}
            onAddQuestionConfirmation={onAddQuestionConfirmation}
            canAddQuestionConfirmation={canAddQuestionConfirmation}
            data-test="nav-section-header"
          />
          <AccordionGroupToggle
            onClick={() => handleClick()}
            data-test="toggle-all-accordions"
          >
            {label ? "Close all" : "Open all"}
          </AccordionGroupToggle>
          <NavigationScrollPane>
            <NavList>
              {questionnaire.introduction && (
                <IntroductionNavItem
                  questionnaire={questionnaire}
                  data-test="nav-introduction"
                />
              )}
              <li>
                <SectionNav
                  questionnaire={questionnaire}
                  isOpen={isOpen}
                  handleChange={handleAccordionChange}
                />
              </li>
            </NavList>
          </NavigationScrollPane>
        </>
      )}
    </Container>
  );
};

UnwrappedNavigationSidebar.propTypes = proptypes.UnwrappedNavigationSidebar;

UnwrappedNavigationSidebar.fragments = {
  NavigationSidebar: gql`
    fragment NavigationSidebar on Questionnaire {
      id
      ...SectionNav
      ...NavigationHeader
      ...IntroductionNavItem
    }

    ${NavigationHeader.fragments.NavigationHeader}
    ${SectionNav.fragments.SectionNav}
    ${IntroductionNavItem.fragments.IntroductionNavItem}
  `,
};

export default flowRight(withRouter)(UnwrappedNavigationSidebar);
