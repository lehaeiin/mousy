import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../styles/theme";
import { commonStyles } from "../styles/common";

export type Substance = {
  substanceName?: string;
  cat?: string;
  manufacturer?: string; // 제조회사
};

type SubstancesEditorProps = {
  substances: Substance[] | undefined;
  onSubstancesChange: (substances: Substance[]) => void;
};

export default function SubstancesEditor({
  substances = [],
  onSubstancesChange,
}: SubstancesEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleAddSubstance = () => {
    const newSubstances = [
      ...substances,
      {
        substanceName: "",
        cat: "",
        manufacturer: "",
      },
    ];
    onSubstancesChange(newSubstances);
    setExpandedIndex(newSubstances.length - 1);
  };

  const handleRemoveSubstance = (index: number) => {
    const updatedSubstances = substances.filter((_, i) => i !== index);
    onSubstancesChange(updatedSubstances);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const handleSubstanceToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleSubstanceUpdate = (index: number, updates: Partial<Substance>) => {
    const updatedSubstances = [...substances];
    updatedSubstances[index] = { ...updatedSubstances[index], ...updates };
    onSubstancesChange(updatedSubstances);
  };

  return (
    <View style={styles.container}>
      {substances.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>물질이 없습니다.</Text>
        </View>
      )}
      {substances.map((substance, index) => (
        <View key={`substance-${index}`} style={styles.substanceCard}>
          <TouchableOpacity
            style={styles.substanceHeader}
            onPress={() => handleSubstanceToggle(index)}
          >
            <Text style={styles.substanceHeaderText}>
              물질 {index + 1}
              {substance.substanceName && `: ${substance.substanceName}`}
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveSubstance(index)}
            >
              <Text style={styles.removeButtonText}>삭제</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {expandedIndex === index && (
            <View style={styles.substanceContent}>
              <View style={styles.fieldFull}>
                <Text style={styles.label}>투여 물질 *</Text>
                <TextInput
                  style={styles.input}
                  value={substance.substanceName || ""}
                  onChangeText={(text) =>
                    handleSubstanceUpdate(index, { substanceName: text })
                  }
                  placeholder="예: compound, cell, virus"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Cat#</Text>
                <TextInput
                  style={styles.input}
                  value={substance.cat || ""}
                  onChangeText={(text) =>
                    handleSubstanceUpdate(index, { cat: text })
                  }
                  placeholder="Cat#"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.fieldFull}>
                <Text style={styles.label}>제조회사</Text>
                <TextInput
                  style={styles.input}
                  value={substance.manufacturer || ""}
                  onChangeText={(text) =>
                    handleSubstanceUpdate(index, { manufacturer: text })
                  }
                  placeholder="제조회사"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={handleAddSubstance}>
        <Text style={styles.addButtonText}>+ 물질 추가</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  emptyContainer: {
    padding: spacing.md,
    alignItems: "center",
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  substanceCard: {
    backgroundColor: colors.background.white25,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    ...shadows.sm,
    borderWidth: 2,
    borderColor: colors.background.white,
    marginBottom: spacing.sm,
  },
  substanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  substanceHeaderText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  removeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.error,
  },
  removeButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.white,
  },
  substanceContent: {
    padding: spacing.md,
    paddingTop: 0,
    gap: spacing.md,
  },
  fieldFull: {
    width: "100%",
  },
  field: {
    flex: 1,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    ...commonStyles.input,
    backgroundColor: colors.background.white,
  },
  addButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  addButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.white,
  },
});

