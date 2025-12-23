import { StyleSheet } from "react-native";
import { colors, spacing, borderRadius, typography } from "../../styles/theme";

export const projectCardStyles = StyleSheet.create({
  cardContainer: {
    marginBottom: spacing.lg,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  deleteButtonContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
    backgroundColor: "transparent",
  },
  deleteButton: {
    width: "100%",
    backgroundColor: colors.error,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.xxl, // 카드와 동일한 borderRadius
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 0,
    overflow: "hidden",
  },
  deleteButtonText: {
    color: colors.text.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  cardWrapper: {
    position: "relative",
    zIndex: 1,
    width: "100%",
  },
  projectCardBlur: {
    borderRadius: borderRadius.xxl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.3)",
    marginBottom: spacing.lg,
  },
  projectCard: {
    backgroundColor: colors.background.white25,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    width: "100%",
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.3)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  projectName: {
    fontSize: typography.sizes["3xl"],
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    letterSpacing: -0.5,
    flex: 1,
    marginRight: spacing.sm,
  },
  experimentCount: {
    fontSize: typography.sizes.lg,
    color: colors.text.white90,
    fontWeight: typography.weights.medium,
  },
  projectDescription: {
    fontSize: typography.sizes.base,
    color: colors.text.white90,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  projectDate: {
    fontSize: typography.sizes.sm,
    color: colors.text.white70,
    fontWeight: typography.weights.medium,
  },
});


