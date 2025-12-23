import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, typography } from "../styles/theme";

type Option<T extends string> = {
  key: T;
  label: string;
  icon?: string;
};

type TemplateButtonGroupProps<T extends string> = {
  options: Option<T>[];
  selectedValue?: T;
  onSelect: (value: T) => void;
};

export default function TemplateButtonGroup<T extends string>({
  options,
  selectedValue,
  onSelect,
}: TemplateButtonGroupProps<T>) {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.button,
            selectedValue === option.key && styles.buttonActive,
          ]}
          onPress={() => onSelect(option.key)}
        >
          <Text
            style={[
              styles.buttonText,
              selectedValue === option.key && styles.buttonTextActive,
            ]}
          >
            {option.icon && `${option.icon} `}
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  button: {
    backgroundColor: colors.background.white25,
    paddingHorizontal: spacing.xl - 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.3)",
  },
  buttonActive: {
    backgroundColor: colors.background.white90,
    borderColor: "rgba(240, 240, 243, 0.5)",
  },
  buttonText: {
    fontSize: typography.sizes.base,
    color: colors.text.white90,
    fontWeight: typography.weights.semibold,
  },
  buttonTextActive: {
    color: colors.text.secondary,
  },
});
