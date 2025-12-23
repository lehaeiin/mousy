import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as Linking from "expo-linking";
import { colors, spacing, borderRadius, typography } from "../styles/theme";
import { ExternalLink } from "../types/experiment";

type LinkListProps = {
  links: ExternalLink[];
  onAddLink: () => void;
  onRemoveLink: (linkId: string) => void;
};

export default function LinkList({
  links,
  onAddLink,
  onRemoveLink,
}: LinkListProps) {
  const handleOpenLink = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("오류", "링크를 열 수 없습니다.");
      }
    } catch (error) {
      Alert.alert("오류", "링크를 열 수 없습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>외부 링크 ({links.length})</Text>
      <TouchableOpacity style={styles.addButton} onPress={onAddLink}>
        <Text style={styles.addButtonText}>🔗 링크 추가</Text>
      </TouchableOpacity>
      {links.length > 0 && (
        <View style={styles.linkList}>
          {links.map((link) => (
            <View key={link.id} style={styles.linkItem}>
              <TouchableOpacity
                style={styles.linkContent}
                onPress={() => handleOpenLink(link.url)}
              >
                <Text style={styles.linkTitle}>{link.title}</Text>
                <Text style={styles.linkUrl}>{link.url}</Text>
                {link.description && (
                  <Text style={styles.linkDescription}>{link.description}</Text>
                )}
                {link.type && (
                  <Text style={styles.linkType}>
                    {link.type === "code" && "💻 코드"}
                    {link.type === "document" && "📄 문서"}
                    {link.type === "data" && "📊 데이터"}
                    {link.type === "other" && "🔗 기타"}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemoveLink(link.id)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxxl - 4,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.white,
    marginBottom: spacing.md,
  },
  addButton: {
    backgroundColor: colors.background.white25,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.3)",
  },
  addButtonText: {
    fontSize: typography.sizes.md,
    color: colors.text.white90,
    fontWeight: typography.weights.semibold,
  },
  linkList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.background.white25,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.3)",
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: typography.sizes.md,
    color: colors.text.white90,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  linkUrl: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  linkDescription: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  linkType: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  removeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: colors.error,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});
