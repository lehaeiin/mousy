import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import ExpandableSection from "../expandableSection";
import SubstancesEditor from "../substancesEditor";
import GroupsEditor from "../groupsEditor";
import LabeledInput from "./labeledInput";
import { InVitroMetadata } from "../../types/experiment";
import { colors, spacing, borderRadius, typography } from "../../styles/theme";
import { commonStyles } from "../../styles/common";
import {
  updateInVitroMetadata,
  parseNumberInput,
} from "../../utils/experimentHelpers";

type InVitroFormProps = {
  expandedSections: {
    cellInfo: boolean;
    treatment: boolean;
    groups: boolean;
  };
  toggleSection: (key: "cellInfo" | "treatment" | "groups") => void;
  metadata: InVitroMetadata;
  setMetadata: (metadata: InVitroMetadata) => void;
};

export default function InVitroForm({
  expandedSections,
  toggleSection,
  metadata,
  setMetadata,
}: InVitroFormProps) {
  const updateMetadata = (key: keyof InVitroMetadata, value: any) => {
    setMetadata(updateInVitroMetadata(metadata, key, value));
  };

  return (
    <>
      {/* 1. Cell Information */}
      <ExpandableSection
        title="1. Cell Information"
        expanded={expandedSections.cellInfo}
        onToggle={() => toggleSection("cellInfo")}
      >
        <View style={styles.grid}>
          <View style={styles.fieldFull}>
            <LabeledInput
              label="Cell Name"
              required
              value={metadata.cellInfo?.cellName || ""}
              onChange={(text: string) =>
                updateMetadata("cellInfo", { cellName: text })
              }
              placeholder="예: HeLa, MCF-7"
            />
          </View>

          <View style={styles.field}>
            <LabeledInput
              label="미디어"
              value={metadata.cellInfo?.media || ""}
              onChange={(text: string) =>
                updateMetadata("cellInfo", { media: text })
              }
              placeholder="배지 (예: DMEM, RPMI-1640)"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Cell 수</Text>
            <View style={styles.rowInputContainer}>
              <TextInput
                style={[styles.input, styles.cellCountInput]}
                value={metadata.cellCount?.coefficient?.toString() || ""}
                onChangeText={(text) =>
                  parseNumberInput(text, (n) =>
                    updateMetadata("cellCount", { coefficient: n })
                  )
                }
                placeholder="n"
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
                textAlign="center"
              />
              <Text style={styles.cellCountSeparator}>× 10</Text>
              <TextInput
                style={[styles.input, styles.cellCountInput]}
                value={metadata.cellCount?.exponent?.toString() || ""}
                onChangeText={(text) =>
                  parseNumberInput(text, (n) =>
                    updateMetadata("cellCount", {
                      exponent: n ? Math.floor(n) : undefined,
                    })
                  )
                }
                placeholder="n"
                keyboardType="numeric"
                placeholderTextColor="#999"
                textAlign="center"
              />
            </View>
          </View>

          <View style={styles.fieldFull}>
            <LabeledInput
              label="Well Type"
              value={metadata.cellInfo?.wellType || ""}
              onChange={(text: string) =>
                updateMetadata("cellInfo", { wellType: text })
              }
              placeholder="예: 96-well, 24-well, 6-well"
            />
          </View>

          <View style={styles.field}>
            <LabeledInput
              label="Origin / Cell type"
              value={metadata.cellInfo?.origin || ""}
              onChange={(text: string) =>
                updateMetadata("cellInfo", { origin: text })
              }
              placeholder="어디서 유래했는지/세포 타입"
            />
          </View>

          <View style={styles.fieldFull}>
            <LabeledInput
              label="판매처"
              value={metadata.cellInfo?.vendor || ""}
              onChange={(text: string) =>
                updateMetadata("cellInfo", { vendor: text })
              }
              placeholder="구매처 (예: ATCC, KCLB)"
            />
          </View>
        </View>
      </ExpandableSection>

      {/* 2. 물질 정보 */}
      <ExpandableSection
        title="2. 물질 정보"
        expanded={expandedSections.treatment}
        onToggle={() => toggleSection("treatment")}
      >
        <SubstancesEditor
          substances={metadata.treatment?.substances}
          onSubstancesChange={(substances) =>
            updateMetadata("treatment", {
              substances: substances.length > 0 ? substances : undefined,
            })
          }
        />
      </ExpandableSection>

      {/* 3. 실험 디자인 및 그룹 정보 */}
      <ExpandableSection
        title="3. 실험 디자인 및 그룹 정보"
        expanded={expandedSections.groups}
        onToggle={() => toggleSection("groups")}
      >
        <GroupsEditor
          groups={metadata.experimentalDesign?.groups}
          onGroupsChange={(groups) =>
            updateMetadata("experimentalDesign", {
              groups: groups.length > 0 ? groups : undefined,
            })
          }
          showAnimalCount={false}
        />
      </ExpandableSection>
    </>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  field: {
    width: "48%",
  },
  fieldFull: {
    width: "100%",
    marginBottom: spacing.md,
  },
  label: {
    ...commonStyles.label,
  },
  input: {
    ...commonStyles.input,
    fontSize: typography.sizes.base,
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.5)",
    backgroundColor: "rgba(139, 69, 19, 0.25)",
  },
  rowInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  cellCountInput: {
    flex: 0.35,
    paddingHorizontal: spacing.xs,
    marginRight: spacing.xs,
  },
  cellCountSeparator: {
    fontSize: 16,
    color: "#fff",
    marginHorizontal: spacing.xs,
  },
});
