import React from "react";
import { Text, StyleSheet } from "react-native";
import { colors, typography } from "../../styles/theme";

type RequiredCheckProps = {
  filled: boolean;
};

export default function RequiredCheck({ filled }: RequiredCheckProps) {
  if (!filled) return null;

  return <Text style={styles.checkIcon}>✓</Text>;
}

const styles = StyleSheet.create({
  checkIcon: {
    fontSize: typography.sizes.md,
    color: colors.success,
    fontWeight: typography.weights.bold,
  },
});
