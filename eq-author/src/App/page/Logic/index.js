import React from "react";
import { NavLink } from "react-router-dom";
import { get } from "lodash";
import PropTypes from "prop-types";

import styled from "styled-components";
import { colors } from "constants/theme";
import { rgba } from "polished";
import { Grid, Column } from "components/Grid";

import EditorLayout from "components/EditorLayout";
import CustomPropTypes from "custom-prop-types";

const activeClassName = "active";

const LogicMainCanvas = styled.div`
  display: flex;
  border: 1px solid ${colors.lightGrey};
  border-radius: 4px;
  background: ${colors.white};
`;

const LogicContainer = styled.div`
  padding: 0.8em;
  border-left: 1px solid ${colors.lightGrey};
`;

const StyledUl = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
`;

const MenuTitle = styled.div`
  width: 100%;
  padding: 1em 1.2em;
  font-weight: bold;
  border-bottom: 1px solid ${colors.lightGrey};
`;

const LogicLink = styled(NavLink)`
  --color-text: ${colors.black};
  text-decoration: none;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1em;
  color: var(--color-text);
  font-size: 1em;
  border-left: 5px solid ${colors.lightGrey};
  border-bottom: 1px solid ${colors.lightGrey};

  &:hover {
    background: ${rgba(0, 0, 0, 0.2)};
  }

  &:active {
    outline: none;
  }

  &.${activeClassName} {
    --color-text: ${colors.white};

    background: ${colors.blue};
    border-left: 5px solid ${colors.orange};
    pointer-events: none;
  }
`;

const Badge = styled.span`
  border-radius: 0.7em;
  border: 1px solid ${colors.white};
  background-color: ${colors.red};
  color: white;
  padding: 0.1em 0.35em;
  font-weight: normal;
  z-index: 2;
  margin-left: auto;
  line-height: 1;
  font-size: 0.9rem;
  pointer-events: none;
  width: 20px;
  height: 20px;
`;

export class UnwrappedLogicPage extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    page: CustomPropTypes.page,
    match: PropTypes.shape({
      params: PropTypes.shape({
        questionnaireId: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  };

  renderContent() {
    const { children } = this.props;

    const page = get(children.props, "page");

    console.log("children", children);
    const TABS = [
      {
        key: "routing",
        label: "Routing logic",
        url: `routing`,
      },
      {
        key: "skip",
        label: "Skip logic",
        url: `skip`,
      },
    ];

    const validationErrors = get(page, "validationErrorInfo", null);

    const tabErrors = tabKey => {
      if (validationErrors === null || validationErrors === undefined) {
        return null;
      }

      const errorsPerTab = {
        routing: [],
        skip: [],
      };

      const { errors } = validationErrors;

      const errorSeparator = errors.reduce((accumulator, error) => {
        const { routing, skip } = accumulator;

        if (error.id.includes("routing")) {
          routing.push(error);
        }
        if (error.id.includes("skipConditions")) {
          skip.push(error);
        }

        return accumulator;
      }, errorsPerTab);

      console.log("errorSeparator", errorSeparator);
      return errorSeparator[tabKey];
    };

    return (
      <LogicMainCanvas>
        <Grid>
          <Column gutters={false} cols={2.5}>
            <MenuTitle>Select your logic</MenuTitle>
            <StyledUl>
              {TABS.map(({ key, label, url }) => {
                console.log("key", key);
                const errors = tabErrors(key);
                console.log("errors", errors);

                return (
                  <li data-test={key} key={key}>
                    <LogicLink exact to={url} activeClassName="active" replace>
                      {label}
                      {errors !== undefined &&
                      errors !== null &&
                      errors.length > 0 ? (
                        <Badge data-test="badge-withCount">
                          {errors.length}
                        </Badge>
                      ) : null}
                    </LogicLink>
                  </li>
                );
              })}
            </StyledUl>
          </Column>
          <Column gutters={false} cols={9.5}>
            <LogicContainer>{children}</LogicContainer>
          </Column>
        </Grid>
      </LogicMainCanvas>
    );
  }

  render() {
    const displayName = get(this.props, "data.page.displayName", "");
    const pageData = get(this.props, "data.page", {});

    return (
      <EditorLayout
        design
        preview
        logic
        page={pageData}
        title={displayName}
        singleColumnLayout
        mainCanvasMaxWidth="80em"
      >
        {this.renderContent()}
      </EditorLayout>
    );
  }
}

export default UnwrappedLogicPage;
