import React from "react";
import { flowRight } from "lodash";
import PropTypes from "prop-types";
import CustomPropTypes from "custom-prop-types";
import { Query, useMutation } from "react-apollo";
import GET_QUESTIONNAIRE from "../graphql/GetQuestionnaire.graphql";
import TOGGLE_PUBLIC_MUTATION from "../graphql/TogglePublicMutation.graphql";
import ALL_USERS from "../graphql/AllUsers.graphql";
import config from "config";

import Loading from "components/Loading";
import Error from "components/Error";
import ToggleSwitch from "components/buttons/ToggleSwitch";
import InformationPanel from "components/Panel";

import { useQuery } from "@apollo/react-hooks";

import { withShowToast } from "components/Toasts";
import {
  Layout,
  PageTitle,
  Description,
  Section,
  SectionTitle,
  EditorTitle,
  SearchInput,
  SearchContainer,
  Separator,
  Wrapper,
  PublicLabel,
  ShareButton,
  AddButton,
  Described,
} from "../styles";

// ------------------------------------------------
/*
I want to be able to wrap the sharing page with the three necessary extras

Succeeded in creating a double wrapped query with HOC's
problem is I think it's redundant

ON WEDNESDAY
Going to rewrite to use the useQuery hook and batch it

*/
// ------------------------------------------------

const propType = {
  TogglePublicLabel: {
    text: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
  },
  Sharing: {
    questionnaire: PropTypes.shape({
      id: PropTypes.string.isRequired,
      isPublic: PropTypes.bool.isRequired,
    }),
  },
  UnwrappedSharing: {
    loading: PropTypes.bool.isRequired,
    error: PropTypes.object, //eslint-disable-line
    data: PropTypes.shape({
      questionnaire: CustomPropTypes.questionnaire,
    }),
    showToast: PropTypes.func.isRequired,
  },
  ShareContent: {
    questionnaireId: PropTypes.string, // Isn't required but is needed
  },
};

const TogglePublicLabel = ({ text, isActive }) => (
  <PublicLabel isActive={isActive}>{text}</PublicLabel>
);

const Sharing = ({ questionnaire, toast }) => {
  const { id, isPublic } = questionnaire;

  const [pub, setIsPublic] = React.useState(isPublic);

  const [updateIsPublic] = useMutation(TOGGLE_PUBLIC_MUTATION);

  const previewUrl = `${config.REACT_APP_LAUNCH_URL}/${
    (questionnaire || {}).id
  }`;

  const togglePublic = () => {
    setIsPublic(!pub);
    updateIsPublic({
      variables: { input: { id, isPublic: !pub } },
    });
  };

  const handleShareClick = () => {
    const textField = document.createElement("textarea");
    textField.setAttribute("data-test", "share-link");
    textField.innerText = previewUrl;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    toast("Link copied to clipboard");
  };

  return (
    <Layout>
      <PageTitle>Share your questionnaire</PageTitle>
      <Description>
        You can share your questionnaire with anyone who has an account with
        Author.
      </Description>
      <ShareButton variant="tertiary" small onClick={handleShareClick}>
        Get shareable link
      </ShareButton>
      <Section>
        <Wrapper>
          <SectionTitle>Public access</SectionTitle>
          <Separator>
            <TogglePublicLabel text="Off" isActive={!pub} />

            <ToggleSwitch
              id="public"
              name="public"
              onChange={togglePublic}
              checked={pub}
            />
            <TogglePublicLabel text="On" isActive={pub} />
          </Separator>
        </Wrapper>
        <InformationPanel>
          Let anyone with an Author account view your questionnaire. If public
          access is off, only editors
        </InformationPanel>
      </Section>
      <Section>
        <SectionTitle>Editors</SectionTitle>
        <InformationPanel>
          Editors can edit questionnaire content, add comments, delete the
          questionnaire and add other editors.
        </InformationPanel>
      </Section>
      <Section>
        <EditorTitle>Add Editors</EditorTitle>
        <Described>
          Search for someone using their name or email address.
        </Described>
        <SearchContainer>
          <SearchInput />
          <AddButton
            type="submit"
            variant="primary"
            data-test="editor-add-button"
          >
            Add
          </AddButton>
        </SearchContainer>
      </Section>
    </Layout>
  );
};

// ------------------------------------------------

const OneWrapper = Component => {
  const WrapperOne = props => (
    <Query
      query={GET_QUESTIONNAIRE}
      variables={{
        input: {
          // This isn't actually defined which is super weird
          questionnaireId: props.questionnaireId,
        },
      }}
      fetchPolicy="no-cache"
    >
      {innerprops => {
        if (innerprops.loading) {
          return <Loading height="38rem">Page loading…</Loading>;
        }
        if (innerprops.error) {
          return <Error>Oops! Something went wrong</Error>;
        }
        return <Component questionnaire={innerprops.data} {...innerprops} />;
      }}
    </Query>
  );
  return WrapperOne;
};

const ToastedUnwrappedSharing = flowRight(withShowToast, OneWrapper)(Sharing);

TogglePublicLabel.propTypes = propType.ToggleLabelComp;
Sharing.propTypes = propType.Share;
// UnwrappedSharing.propTypes = propType.UnwrappedSharing;
// ShareContent.propTypes = propType.ShareContent;

export default ToastedUnwrappedSharing;
