import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { commonStyles } from "../../styles/common";
import { colors, spacing, borderRadius, typography } from "../../styles/theme";

type SaveButtonProps = {
  loading: boolean;
  onPress: () => void;
};

export default function SaveButton({ loading, onPress }: SaveButtonProps) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onPress}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "저장 중..." : "저장"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    padding: spacing.xl,
    paddingBottom: 40,
    borderTopWidth: 0,
  },
  button: {
    ...commonStyles.buttonNeumorphic,
    backgroundColor: "rgba(139, 69, 19, 0.6)",
    paddingVertical: spacing.lg + 2,
  },
  buttonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  buttonText: {
    ...commonStyles.buttonText,
  },
});


