import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { colors, spacing, borderRadius, typography } from "../styles/theme";

type AttachedFile = {
  id: string;
  url: string;
  name?: string;
  isLocal?: boolean;
};

type ImageGalleryProps = {
  images: string[];
  files: AttachedFile[];
  isImageLoading: boolean;
  onAddImage: (source: "camera" | "gallery") => void;
  onRemoveImage: (index: number) => void;
};

export default function ImageGallery({
  images,
  files,
  isImageLoading,
  onAddImage,
  onRemoveImage,
}: ImageGalleryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>이미지 ({images.length})</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isImageLoading && styles.buttonDisabled]}
          onPress={() => onAddImage("camera")}
          disabled={isImageLoading}
        >
          {isImageLoading ? (
            <ActivityIndicator size="small" color={colors.text.white} />
          ) : (
            <Text style={styles.buttonText}>📷 촬영</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, isImageLoading && styles.buttonDisabled]}
          onPress={() => onAddImage("gallery")}
          disabled={isImageLoading}
        >
          {isImageLoading ? (
            <ActivityIndicator size="small" color={colors.text.white} />
          ) : (
            <Text style={styles.buttonText}>🖼 갤러리</Text>
          )}
        </TouchableOpacity>
      </View>
      {isImageLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>이미지를 처리하는 중...</Text>
        </View>
      )}
      {images.length > 0 && (
        <View style={styles.imageGrid}>
          {images.map((imageUrl, index) => {
            const file = files.find((f) => f.url === imageUrl);
            return (
              <View key={index} style={styles.imageItem}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error(
                      `이미지 로드 실패 [${index}]:`,
                      imageUrl,
                      error.nativeEvent.error
                    );
                  }}
                />
                {file?.isLocal && (
                  <View style={styles.localBadge}>
                    <Text style={styles.localBadgeText}>오프라인</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => onRemoveImage(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          })}
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
  buttonContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  button: {
    flex: 1,
    backgroundColor: colors.background.white25,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.3)",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: typography.sizes.md,
    color: colors.text.white90,
    fontWeight: typography.weights.semibold,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.white15,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  imageItem: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.background.white10,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  localBadge: {
    position: "absolute",
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  localBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
  },
  removeButton: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: colors.text.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
