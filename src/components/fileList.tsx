import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing, borderRadius, typography } from "../styles/theme";

type AttachedFile = {
  id: string;
  url: string;
  name: string;
  size?: number;
  isLocal?: boolean;
};

type FileListProps = {
  files: AttachedFile[];
  images: string[];
  onAddFile: () => void;
  onRemoveFile: (fileId: string) => void;
};

export default function FileList({
  files,
  images,
  onAddFile,
  onRemoveFile,
}: FileListProps) {
  const nonImageFiles = files.filter((f) => !images.includes(f.url));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>파일 ({files.length})</Text>
      <TouchableOpacity style={styles.addButton} onPress={onAddFile}>
        <Text style={styles.addButtonText}>📎 파일 첨부</Text>
      </TouchableOpacity>
      {nonImageFiles.length > 0 && (
        <View style={styles.fileList}>
          {nonImageFiles.map((file) => (
            <View key={file.id} style={styles.fileItem}>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{file.name}</Text>
                {file.size && (
                  <Text style={styles.fileSize}>
                    {(file.size / 1024).toFixed(1)} KB
                  </Text>
                )}
                {file.isLocal && (
                  <Text style={styles.localFileText}>오프라인</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemoveFile(file.id)}
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
  fileList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.white25,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.3)",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: typography.sizes.md,
    color: colors.text.white90,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  fileSize: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  localFileText: {
    fontSize: typography.sizes.xs,
    color: colors.warning,
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
