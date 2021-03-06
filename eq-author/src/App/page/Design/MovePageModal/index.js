import React, { useMemo, useState } from "react";
import styled from "styled-components";
import MoveModal from "components/MoveModal";
import PropTypes from "prop-types";
import CustomPropTypes from "custom-prop-types";
import PositionModal from "components/PositionModal";
import ItemSelectModal from "components/ItemSelectModal";
import ItemSelect, { Option } from "components/ItemSelectModal/ItemSelect";
import { find, uniqueId } from "lodash";
import Icon from "assets/icon-select.svg";

import { colors, radius } from "constants/theme";
import Truncated from "components/Truncated";

import { useQuestionnaire } from "components/QuestionnaireContext";

const Label = styled.label`
  display: block;
  font-size: 1em;
  font-weight: bold;
  margin-bottom: 0.25rem;
  margin-top: 1.25rem;
`;

const Trigger = styled.button.attrs({ type: "button" })`
  width: 100%;
  font-size: 1em;
  padding: 0.5rem;
  padding-right: 2em;
  background: ${colors.white} url("${Icon}") no-repeat right center;
  border: solid 1px ${colors.borders};
  text-align: left;
  border-radius: ${radius};
  color: ${colors.black};

  &:focus {
    box-shadow: 0 0 0 3px ${colors.tertiary}, inset 0 0 0 1px ${colors.primary};
    outline: none;
  }
`;

const propTypes = {
  sectionId: PropTypes.string.isRequired,
  page: CustomPropTypes.page,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onMovePage: PropTypes.func.isRequired,
};

const MovePageModal = ({ sectionId, page, isOpen, onClose, onMovePage }) => {
  const { questionnaire } = useQuestionnaire();
  const [isSectionSelectOpen, setIsSectionSelectOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(sectionId);
  const [previousSelectedSectionId, setPreviousSelectedSectionId] = useState(
    null
  );

  const handleCloseSectionSelect = () => {
    setIsSectionSelectOpen(false);
    setSelectedSectionId(previousSelectedSectionId);
  };

  const handleOpenSectionSelect = () => {
    setIsSectionSelectOpen(true);
    setPreviousSelectedSectionId(selectedSectionId);
  };

  const handleSectionChange = ({ value }) => setSelectedSectionId(value);

  const handleSectionConfirm = (e) => {
    e.preventDefault();
    setIsSectionSelectOpen(false);
  };

  const handlePageMove = ({ position }) => {
    onMovePage({
      from: {
        id: page.id,
        sectionId: sectionId,
        position: page.position,
      },
      to: {
        id: page.id,
        sectionId: selectedSectionId,
        position: position,
      },
    });
  };

  const sectionButtonId = uniqueId("MovePageModal");
  const selectedSection = useMemo(
    () =>
      questionnaire && find(questionnaire.sections, { id: selectedSectionId }),
    [questionnaire, selectedSectionId]
  );

  return useMemo(
    () =>
      questionnaire ? (
        <MoveModal title={"Move question"} isOpen={isOpen} onClose={onClose}>
          <Label htmlFor={sectionButtonId}>Section</Label>
          <Trigger id={sectionButtonId} onClick={handleOpenSectionSelect}>
            <Truncated>{selectedSection.displayName}</Truncated>
          </Trigger>
          <ItemSelectModal
            title="Section"
            data-test={"section-select-modal"}
            isOpen={isSectionSelectOpen}
            onClose={handleCloseSectionSelect}
            onConfirm={handleSectionConfirm}
          >
            <ItemSelect
              data-test="section-item-select"
              name="section"
              value={selectedSection.id}
              onChange={handleSectionChange}
            >
              {questionnaire.sections.map((section) => (
                <Option key={section.id} value={section.id}>
                  {section.displayName}
                </Option>
              ))}
            </ItemSelect>
          </ItemSelectModal>
          <PositionModal
            data-test={"page-position-modal"}
            options={selectedSection.folders.flatMap(({ pages }) => pages)}
            onMove={handlePageMove}
            selected={page}
          />
        </MoveModal>
      ) : null,
    [selectedSection, questionnaire, page, isOpen, isSectionSelectOpen]
  );
};

MovePageModal.propTypes = propTypes;

export default MovePageModal;
