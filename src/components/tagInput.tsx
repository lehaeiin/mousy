import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { colors, spacing, borderRadius, typography } from "../styles/theme";
import { commonStyles } from "../styles/common";

type TagInputProps = {
  tags: string[];
  tagInput: string;
  onTagInputChange: (text: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
};

export default function TagInput({
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
}: TagInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>태그</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={tagInput}
          onChangeText={onTagInputChange}
          placeholder="태그 입력 후 엔터"
          placeholderTextColor="#999"
          onSubmitEditing={onAddTag}
        />
        <TouchableOpacity style={styles.addButton} onPress={onAddTag}>
          <Text style={styles.addButtonText}>추가</Text>
        </TouchableOpacity>
      </View>
      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tag}
              onPress={() => onRemoveTag(tag)}
            >
              <Text style={styles.tagText}>{tag}</Text>
              <Text style={styles.tagRemove}>✕</Text>
            </TouchableOpacity>
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
    ...commonStyles.label,
  },
  inputContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  input: {
    flex: 1,
    ...commonStyles.input,
    fontSize: typography.sizes.base,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: colors.text.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.white10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.lg,
    gap: spacing.xs + 2,
  },
  tagText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  tagRemove: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
});
