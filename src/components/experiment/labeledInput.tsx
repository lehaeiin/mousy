import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, typography } from "../../styles/theme";
import { commonStyles } from "../../styles/common";

type LabeledInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  filled?: boolean;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  multiline?: boolean;
  style?: any;
};

export default function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  filled,
  keyboardType = "default",
  multiline = false,
  style,
}: LabeledInputProps) {
  const isFilled = filled ?? value.trim().length > 0;

  return (
    <View style={style}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label} {required && "*"}
        </Text>
        {isFilled && <Text style={styles.checkIcon}>✓</Text>}
      </View>
      <TextInput
        style={[styles.input, isFilled && styles.inputFilled]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  label: {
    ...commonStyles.label,
  },
  checkIcon: {
    fontSize: typography.sizes.md,
    color: colors.success,
    fontWeight: typography.weights.bold,
  },
  input: {
    backgroundColor: "rgba(139, 69, 19, 0.25)",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: typography.sizes.base,
    color: colors.text.white,
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.2)",
  },
  inputFilled: {
    borderColor: "rgba(76, 175, 80, 0.3)",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
});
