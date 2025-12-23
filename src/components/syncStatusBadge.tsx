import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, typography } from "../styles/theme";

interface SyncStatusBadgeProps {
  synced: boolean;
  size?: "small" | "medium";
}

export default function SyncStatusBadge({
  synced,
  size = "small",
}: SyncStatusBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        synced ? styles.syncedBadge : styles.pendingBadge,
        size === "medium" && styles.mediumBadge,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          synced ? styles.syncedText : styles.pendingText,
          size === "medium" && styles.mediumText,
        ]}
      >
        {synced ? "✓ 동기화" : "⏳ 대기 중..."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: "flex-start",
  },
  mediumBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  syncedBadge: {
    backgroundColor: colors.success + "20",
    borderWidth: 1,
    borderColor: colors.success,
  },
  pendingBadge: {
    backgroundColor: colors.warning + "20",
    borderWidth: 1,
    borderColor: colors.warning,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  mediumText: {
    fontSize: typography.sizes.sm,
  },
  syncedText: {
    color: colors.success,
  },
  pendingText: {
    color: colors.warning,
  },
});









