import React, { useState } from "react";

import { useMutation, useQuery } from "@apollo/react-hooks";

import PropTypes from "prop-types";

import styled from "styled-components";

import Loading from "components/Loading";
import Error from "components/Error";
import Panel from "components/Panel";
import EditorPage from "components/EditorLayout";
import EditorToolbar from "components/EditorToolbar";
import Collapsible from "components/Collapsible";
import DeleteConfirmDialog from "components/DeleteConfirmDialog";
import withDeleteFolder from "./withDeleteFolder";
import { buildFolderPath, buildSectionPath } from "utils/UrlUtils";
import onCompleteDelete from "./onCompleteDelete";
// import getNextFolder from "utils/getNextOnDelete";
import getNextSection from "utils/getNextOnDelete";

import GET_FOLDER_QUERY from "./getFolderQuery.graphql";
import UPDATE_FOLDER_MUTATION from "./updateFolderMutation.graphql";
import DELETE_FOLDER_MUTATION from "./deleteFolder.graphql";

// import questionConfirmationIcon from "./icon-questionnaire.svg";
import IconFolder from "assets/icon-folder.svg?inline";

const Guidance = styled(Collapsible)`
  margin-left: 2em;
  margin-right: 2em;
`;

const StyledPanel = styled(Panel)`
  & > h2 {
    margin-left: 2em;
    margin-right: 2em;
    font-size: 1em;
  }

  & > p {
    margin-left: 2em;
    margin-right: 2em;
  }
`;

const FolderDesignPage = ({ match, history }) => {
  const { folderId, questionnaireId } = match.params;

  // console.log("match1", match);
  // console.log("history1", history);

  const { loading, error, data } = useQuery(GET_FOLDER_QUERY, {
    variables: { input: { folderId } },
  });
  console.log("data ,,,,,", data);

  const [saveShortCode] = useMutation(UPDATE_FOLDER_MUTATION);

  const [deleteFolder] = useMutation(DELETE_FOLDER_MUTATION, {
    // onCompleted: onCompleteDelete,
    onCompleted: (data) => {
      onCompleteDelete(data, history, folderId, questionnaireId);
    },
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (loading) {
    return (
      <EditorPage>
        <Panel>
          <Loading height="38rem" />
        </Panel>
      </EditorPage>
    );
  }

  if (error) {
    return (
      <EditorPage>
        <Panel>
          <Error>Oops! Something went wrong.</Error>
        </Panel>
      </EditorPage>
    );
  }

  if (!data) {
    return (
      <EditorPage>
        <Panel>
          <Error>This folder does not exist.</Error>
        </Panel>
      </EditorPage>
    );
  }

  const {
    folder: { id, alias },
  } = data;

  const shortCodeOnUpdate = (alias) => {
    return saveShortCode({
      variables: { input: { folderId: id, alias } },
    });
  };

  const handleDeleteFolder = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleModalClose = () => {
    setShowDeleteModal(false);
  };

  const handleModalConfirm = () => {
    setShowDeleteModal(false);
    return deleteFolder({
      variables: { input: { id } },
    });
  };

  return (
    <EditorPage title={alias || "Untitled folder"}>
      <StyledPanel data-test="folders-page">
        <EditorToolbar
          shortCode={alias}
          shortCodeOnUpdate={shortCodeOnUpdate}
          onMove={() => alert("onMove")}
          onDuplicate={() => alert("onDuplicate")}
          onDelete={handleDeleteFolder}
          disableMove
          disableDuplicate
          showDeleteModal={showDeleteModal}
          handleModalClose={handleModalClose}
          handleModalConfirm={handleModalConfirm}
          // disableDelete
          key={`toolbar-folder-${folderId}`}
        />
        <h2>Folders</h2>
        <p>
          Folders are used to apply an action or event to multiple questions at
          once. Respondents do not see the folders.
        </p>
        <Guidance
          title="What is the benefit of using folders?"
          key={`guidance-folder-${folderId}`}
        >
          <p>
            Folders are groups of related questions. Logic can be applied to the
            whole folder or each question within the folder, they allow you to
            build more complex navigation in your questionnaire.
          </p>
          <p>
            Folders do not appear as sections when respondents are completing
            the questionnaire; respondents only see the questions contained
            within folders if they meet the conditions you have applied.
          </p>
        </Guidance>
      </StyledPanel>
    </EditorPage>
  );
};

FolderDesignPage.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line
  // onDeleteFolder: PropTypes.func.isRequired,
};

export default FolderDesignPage;
