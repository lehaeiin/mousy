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

type LinkModalProps = {
  visible: boolean;
  linkTitle: string;
  linkUrl: string;
  linkType: "code" | "document" | "data" | "other";
  linkDescription: string;
  onLinkTitleChange: (text: string) => void;
  onLinkUrlChange: (text: string) => void;
  onLinkTypeChange: (type: "code" | "document" | "data" | "other") => void;
  onLinkDescriptionChange: (text: string) => void;
  onAdd: () => void;
  onCancel: () => void;
};

export default function LinkModal({
  visible,
  linkTitle,
  linkUrl,
  linkType,
  linkDescription,
  onLinkTitleChange,
  onLinkUrlChange,
  onLinkTypeChange,
  onLinkDescriptionChange,
  onAdd,
  onCancel,
}: LinkModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Text style={styles.title}>외부 링크 추가</Text>

        <Text style={styles.label}>제목</Text>
        <TextInput
          style={styles.input}
          value={linkTitle}
          onChangeText={onLinkTitleChange}
          placeholder="예: Flow cytometry 분석"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>URL</Text>
        <TextInput
          style={styles.input}
          value={linkUrl}
          onChangeText={onLinkUrlChange}
          placeholder="https://colab.research.google.com/..."
          placeholderTextColor="#999"
          keyboardType="url"
          autoCapitalize="none"
        />

        <Text style={styles.label}>타입</Text>
        <View style={styles.typeContainer}>
          {(["code", "document", "data", "other"] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                linkType === type && styles.typeButtonActive,
              ]}
              onPress={() => onLinkTypeChange(type)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  linkType === type && styles.typeButtonTextActive,
                ]}
              >
                {type === "code" && "💻 코드"}
                {type === "document" && "📄 문서"}
                {type === "data" && "📊 데이터"}
                {type === "other" && "🔗 기타"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>설명 (선택)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={linkDescription}
          onChangeText={onLinkDescriptionChange}
          placeholder="예: CD4/CD8 비율 계산"
          placeholderTextColor="#999"
          multiline
          textAlignVertical="top"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonCancel]}
            onPress={onCancel}
          >
            <Text style={styles.buttonCancelText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSave]}
            onPress={onAdd}
          >
            <Text style={styles.buttonSaveText}>추가</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    backgroundColor: colors.background.white90,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: "90%",
    maxHeight: "80%",
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  label: {
    ...commonStyles.label,
  },
  input: {
    ...commonStyles.input,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  textArea: {
    minHeight: 80,
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  typeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.background.white10,
    backgroundColor: colors.background.white25,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  typeButtonTextActive: {
    color: colors.text.white,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  buttonCancel: {
    backgroundColor: colors.background.white25,
  },
  buttonSave: {
    backgroundColor: colors.primary,
  },
  buttonCancelText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
  },
  buttonSaveText: {
    fontSize: typography.sizes.md,
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
  },
});





