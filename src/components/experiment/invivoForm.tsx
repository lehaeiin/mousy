import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from "react-native";
import ExpandableSection from "../expandableSection";
import SubstancesEditor from "../substancesEditor";
import GroupsEditor from "../groupsEditor";
import LabeledInput from "./labeledInput";
import { InVivoMetadata } from "../../types/experiment";
import { colors, spacing, borderRadius, typography } from "../../styles/theme";
import { commonStyles } from "../../styles/common";
import {
  updateInVivoMetadata,
  parseNumberInput,
} from "../../utils/experimentHelpers";

type InVivoFormProps = {
  expandedSections: {
    animalInfo: boolean;
    treatment: boolean;
    experimentalDesign: boolean;
    welfare: boolean;
    environment: boolean;
    sampling: boolean;
  };
  toggleSection: (
    key:
      | "animalInfo"
      | "treatment"
      | "experimentalDesign"
      | "welfare"
      | "environment"
      | "sampling"
  ) => void;
  metadata: InVivoMetadata;
  setMetadata: (metadata: InVivoMetadata) => void;
  legacy: {
    strain: string;
    setStrain: (v: string) => void;
    ageWeeks: string;
    setAgeWeeks: (v: string) => void;
    mouseVendor: string;
    setMouseVendor: (v: string) => void;
    diet: string;
    setDiet: (v: string) => void;
    runNumber: string;
    setRunNumber: (v: string) => void;
  };
};

export default function InVivoForm({
  expandedSections,
  toggleSection,
  metadata,
  setMetadata,
  legacy,
}: InVivoFormProps) {
  const updateMetadata = (key: keyof InVivoMetadata, value: any) => {
    setMetadata(updateInVivoMetadata(metadata, key, value));
  };

  return (
    <>
      {/* 1. 동물 개체 기본 정보 */}
      <ExpandableSection
        title="1. 동물 개체 기본 정보"
        expanded={expandedSections.animalInfo}
        onToggle={() => toggleSection("animalInfo")}
      >
        <View style={styles.grid}>
          <View style={styles.field}>
            <LabeledInput
              label="Strain"
              required
              value={metadata.animalInfo?.strain || legacy.strain}
              onChange={(text: string) => {
                legacy.setStrain(text);
                updateMetadata("animalInfo", { strain: text });
              }}
              placeholder="예: C57BL/6J"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>성별</Text>
            <View style={styles.sexSelector}>
              {(["male", "female", "unknown"] as const).map((sex, index) => (
                <TouchableOpacity
                  key={sex}
                  style={[
                    styles.sexButton,
                    metadata.animalInfo?.sex === sex && styles.sexButtonActive,
                    index < 2 && styles.sexButtonMargin,
                  ]}
                  onPress={() => updateMetadata("animalInfo", { sex })}
                >
                  <Text
                    style={[
                      styles.sexButtonText,
                      metadata.animalInfo?.sex === sex &&
                        styles.sexButtonTextActive,
                    ]}
                  >
                    {sex === "male"
                      ? "수컷"
                      : sex === "female"
                      ? "암컷"
                      : "미상"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <LabeledInput
              label="나이 (주령)"
              required
              value={
                metadata.animalInfo?.ageWeeks?.toString() || legacy.ageWeeks
              }
              onChange={(text: string) => {
                legacy.setAgeWeeks(text);
                parseNumberInput(text, (n) =>
                  updateMetadata("animalInfo", {
                    ageWeeks: n ? Math.floor(n) : undefined,
                  })
                );
              }}
              placeholder="예: 8"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.field}>
            <LabeledInput
              label="유전형"
              value={metadata.animalInfo?.genotype || ""}
              onChange={(text: string) =>
                updateMetadata("animalInfo", { genotype: text })
              }
              placeholder="예: WT, KO, Tg 등"
            />
          </View>

          <View style={styles.field}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>transgenic</Text>
              <Switch
                value={metadata.animalInfo?.isTransgenic || false}
                onValueChange={(value) =>
                  updateMetadata("animalInfo", { isTransgenic: value })
                }
              />
            </View>
          </View>

          <View style={styles.fieldFull}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>knockout</Text>
              <Switch
                value={metadata.animalInfo?.isKnockout || false}
                onValueChange={(value) =>
                  updateMetadata("animalInfo", { isKnockout: value })
                }
              />
            </View>
            {metadata.animalInfo?.isKnockout && (
              <LabeledInput
                label="Knockout Type"
                value={metadata.animalInfo?.knockoutType || ""}
                onChange={(text) =>
                  updateMetadata("animalInfo", { knockoutType: text })
                }
                placeholder="knockout type (e.g., p53 KO, IL-6 KO)"
              />
            )}
          </View>

          <View style={styles.field}>
            <LabeledInput
              label="공급업체"
              value={metadata.animalInfo?.vendor || legacy.mouseVendor}
              onChange={(text: string) => {
                legacy.setMouseVendor(text);
                updateMetadata("animalInfo", { vendor: text });
              }}
              placeholder="예: Jackson Lab"
            />
          </View>
        </View>
      </ExpandableSection>

      {/* 2. 처치(약물·물질) 정보 */}
      <ExpandableSection
        title="2. 처치(약물·물질) 정보"
        expanded={expandedSections.treatment}
        onToggle={() => toggleSection("treatment")}
      >
        <>
          <View style={styles.substancesEditorWrapper}>
            <SubstancesEditor
              substances={metadata.treatment?.substances}
              onSubstancesChange={(substances) =>
                updateMetadata("treatment", {
                  substances: substances.length > 0 ? substances : undefined,
                })
              }
            />
          </View>
          <View style={styles.grid}>
            <View style={styles.fieldFull}>
              <Text style={styles.label}>용량</Text>
              <View style={styles.valueUnitRow}>
                <TextInput
                  style={[styles.input, styles.valueInput]}
                  value={metadata.treatment?.dose?.toString() || ""}
                  onChangeText={(text) =>
                    parseNumberInput(text, (n) =>
                      updateMetadata("treatment", { dose: n })
                    )
                  }
                  placeholder="예: 10"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={[styles.input, styles.unitInput]}
                  value={metadata.treatment?.doseUnit || ""}
                  onChangeText={(text) =>
                    updateMetadata("treatment", { doseUnit: text })
                  }
                  placeholder="예: mg/kg"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.fieldFull}>
              <Text style={styles.label}>투여 부피</Text>
              <View style={styles.valueUnitRow}>
                <TextInput
                  style={[styles.input, styles.valueInput]}
                  value={metadata.treatment?.volume?.toString() || ""}
                  onChangeText={(text) =>
                    parseNumberInput(text, (n) =>
                      updateMetadata("treatment", { volume: n })
                    )
                  }
                  placeholder="예: 100"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={[styles.input, styles.unitInput]}
                  value={metadata.treatment?.volumeUnit || ""}
                  onChangeText={(text) =>
                    updateMetadata("treatment", { volumeUnit: text })
                  }
                  placeholder="예: μL, mL"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.fieldFull}>
              <Text style={styles.label}>Buffer</Text>
              <TextInput
                style={styles.input}
                value={metadata.treatment?.vehicle || ""}
                onChangeText={(text: string) =>
                  updateMetadata("treatment", { vehicle: text })
                }
                placeholder="예: saline, PBS, DMSO"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.fieldFull}>
              <Text style={styles.label}>투여 경로</Text>
              <View style={styles.routeSelector}>
                {(
                  ["oral", "ip", "iv", "sc", "im", "topical", "other"] as const
                ).map((route, index) => (
                  <TouchableOpacity
                    key={route}
                    style={[
                      styles.routeButton,
                      index < 6 && styles.routeButtonMargin,
                      metadata.treatment?.route === route &&
                        styles.routeButtonActive,
                    ]}
                    onPress={() => updateMetadata("treatment", { route })}
                  >
                    <Text
                      style={[
                        styles.routeButtonText,
                        metadata.treatment?.route === route &&
                          styles.routeButtonTextActive,
                      ]}
                    >
                      {route === "oral"
                        ? "oral"
                        : route === "ip"
                        ? "i.p"
                        : route === "iv"
                        ? "i.v"
                        : route === "sc"
                        ? "s.c"
                        : route === "im"
                        ? "i.m"
                        : route === "topical"
                        ? "topical"
                        : "기타"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {metadata.treatment?.route === "other" && (
                <LabeledInput
                  label="기타 경로 상세"
                  value={metadata.treatment?.routeOther || ""}
                  onChange={(text) =>
                    updateMetadata("treatment", { routeOther: text })
                  }
                  placeholder="기타 경로 상세"
                />
              )}
            </View>

            <View style={styles.fieldFull}>
              <LabeledInput
                label="투여 빈도"
                value={metadata.treatment?.frequency || ""}
                onChange={(text: string) =>
                  updateMetadata("treatment", { frequency: text })
                }
                placeholder="e.g., once daily, 3x/week"
              />
            </View>
          </View>
        </>
      </ExpandableSection>

      {/* 3. 실험 디자인 및 그룹 정보 */}
      <ExpandableSection
        title="3. 실험 디자인 및 그룹 정보"
        expanded={expandedSections.experimentalDesign}
        onToggle={() => toggleSection("experimentalDesign")}
      >
        <GroupsEditor
          groups={metadata.experimentalDesign?.groups}
          onGroupsChange={(groups) =>
            updateMetadata("experimentalDesign", {
              groups: groups.length > 0 ? groups : undefined,
            })
          }
          showAnimalCount={true}
        />
      </ExpandableSection>

      {/* 4. 환경·실험 조건 */}
      <ExpandableSection
        title="4. 환경·실험 조건"
        expanded={expandedSections.environment}
        onToggle={() => toggleSection("environment")}
      >
        <View style={styles.grid}>
          <View style={styles.fieldFull}>
            <LabeledInput
              label="사료"
              value={metadata.environment?.food || legacy.diet}
              onChange={(text: string) => {
                legacy.setDiet(text);
                updateMetadata("environment", { food: text });
              }}
              placeholder="예: Standard chow"
            />
          </View>
        </View>
      </ExpandableSection>

      {/* 레거시: 간단한 마우스 정보 (호환성 유지) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>기본 정보</Text>
        <View style={styles.grid}>
          <View style={styles.field}>
            <LabeledInput
              label="회차"
              value={legacy.runNumber}
              onChange={legacy.setRunNumber}
              placeholder="예: 1"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xxxl - 4,
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
  },
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
  substancesEditorWrapper: {
    marginBottom: spacing.xxl,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: typography.sizes.base,
    color: colors.text.white,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  inputFlex: {
    flex: 1,
  },
  inputSpacing: {
    marginRight: spacing.sm,
  },
  rowInputContainer: {
    flexDirection: "row",
    marginTop: spacing.sm,
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  sexSelector: {
    flexDirection: "row",
    marginTop: spacing.sm,
  },
  sexButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.3)",
    backgroundColor: colors.background.white25,
    alignItems: "center",
    justifyContent: "center",
  },
  sexButtonMargin: {
    marginRight: spacing.sm,
  },
  sexButtonActive: {
    backgroundColor: colors.background.white90,
    borderColor: "rgba(240, 240, 243, 0.5)",
  },
  sexButtonText: {
    fontSize: typography.sizes.base,
    color: colors.text.white90,
    fontWeight: typography.weights.semibold,
  },
  sexButtonTextActive: {
    color: colors.text.secondary,
  },
  routeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.sm,
  },
  routeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.3)",
    backgroundColor: colors.background.white25,
  },
  routeButtonMargin: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  routeButtonActive: {
    backgroundColor: colors.background.white90,
    borderColor: "rgba(240, 240, 243, 0.5)",
  },
  routeButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  routeButtonTextActive: {
    color: colors.text.secondary,
  },
  valueUnitRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  valueInput: {
    flex: 1,
  },
  unitInput: {
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
});
