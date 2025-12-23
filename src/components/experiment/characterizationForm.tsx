import React from "react";
import { View } from "react-native";
import ExpandableSection from "../expandableSection";
import SubstancesEditor from "../substancesEditor";
import { CharacterizationMetadata } from "../../types/experiment";

type CharacterizationFormProps = {
  expandedSections: {
    treatment: boolean;
  };
  toggleSection: (key: "treatment") => void;
  metadata: CharacterizationMetadata;
  setMetadata: (metadata: CharacterizationMetadata) => void;
};

export default function CharacterizationForm({
  expandedSections,
  toggleSection,
  metadata,
  setMetadata,
}: CharacterizationFormProps) {
  return (
    <ExpandableSection
      title="물질 정보"
      expanded={expandedSections.treatment}
      onToggle={() => toggleSection("treatment")}
    >
      <SubstancesEditor
        substances={metadata.treatment?.substances}
        onSubstancesChange={(substances) =>
          setMetadata({
            ...metadata,
            treatment: {
              ...metadata.treatment,
              substances:
                substances.length > 0 ? substances : undefined,
            },
          })
        }
      />
    </ExpandableSection>
  );
}
