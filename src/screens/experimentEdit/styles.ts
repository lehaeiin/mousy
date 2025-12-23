import { StyleSheet } from "react-native";
import { commonStyles } from "../../styles/common";
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from "../../styles/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    ...commonStyles.scrollContent,
  },
  section: {
    marginBottom: spacing.xxxl - 4,
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
  },
  templateContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  templateButton: {
    backgroundColor: colors.background.white25,
    paddingHorizontal: spacing.xl - 2,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.3)",
  },
  templateButtonActive: {
    backgroundColor: colors.background.white90,
    borderColor: "rgba(240, 240, 243, 0.5)",
  },
  templateButtonText: {
    fontSize: typography.sizes.base,
    color: colors.text.white90,
    fontWeight: typography.weights.semibold,
  },
  templateButtonTextActive: {
    color: colors.text.secondary,
  },
  label: {
    ...commonStyles.label,
  },
  titleInput: {
    ...commonStyles.input,
    fontSize: typography.sizes.xl,
  },
  typeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  typeDisplayText: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "500",
    marginRight: 8,
  },
  removeButton: {
    fontSize: 16,
    color: "#1976D2",
  },
  notesInput: {
    ...commonStyles.input,
    minHeight: 200,
  },
  tagInputContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagInput: {
    flex: 1,
    ...commonStyles.input,
    fontSize: typography.sizes.base,
  },
  addTagButton: {
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
  addTagButtonText: {
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
  timestamp: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
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
  saveButton: {
    ...commonStyles.buttonNeumorphic,
    backgroundColor: "rgba(139, 69, 19, 0.6)",
    paddingVertical: spacing.lg + 2,
  },
  saveButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  saveButtonText: {
    ...commonStyles.buttonText,
  },
  autoGenerateButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.background.white25,
    borderRadius: borderRadius.sm,
  },
  autoGenerateText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  inVivoInput: {
    ...commonStyles.input,
    fontSize: typography.sizes.base,
    marginTop: spacing.sm,
  },
  addButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.success,
    borderRadius: borderRadius.sm,
  },
  addButtonText: {
    fontSize: typography.sizes.xs,
    color: colors.text.white,
    fontWeight: typography.weights.medium,
  },
  conditionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  conditionInputs: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
  },
  conditionInput: {
    ...commonStyles.input,
    fontSize: typography.sizes.xs,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.sm,
  },
  removeConditionButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.error,
    borderRadius: borderRadius.lg,
  },
  removeConditionText: {
    color: colors.text.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  hintText: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    fontStyle: "italic",
    marginTop: spacing.sm,
  },
  titleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  inVivoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  inVivoField: {
    width: "48%",
  },
  inVivoFieldFull: {
    width: "100%",
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  expandIcon: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  sexSelector: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  sexButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.background.white10,
    backgroundColor: colors.background.white90,
    alignItems: "center",
  },
  sexButtonActive: {
    backgroundColor: colors.info,
    borderColor: colors.info,
  },
  sexButtonText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  sexButtonTextActive: {
    color: colors.text.white,
  },
  routeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  routeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.background.white10,
    backgroundColor: colors.background.white90,
  },
  routeButtonActive: {
    backgroundColor: colors.info,
    borderColor: colors.info,
  },
  routeButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  routeButtonTextActive: {
    color: colors.text.white,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupCard: {
    backgroundColor: colors.background.white90,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  rowInputContainer: {
    flexDirection: "row",
    marginTop: spacing.sm,
    alignItems: "center",
    gap: spacing.xs,
  },
  addGroupButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  addGroupButtonText: {
    color: colors.text.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  emptyStateContainer: {
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: typography.sizes["2xl"],
    color: colors.text.white,
    fontWeight: typography.weights.bold,
  },
  backButtonPlaceholder: {
    width: 40,
  },
  topHeaderTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
  },
  labelWithCheck: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkIcon: {
    fontSize: typography.sizes.md,
    color: colors.success,
    fontWeight: typography.weights.bold,
  },
  inputFilled: {
    borderColor: colors.success,
    borderWidth: 1.5,
    backgroundColor: "rgba(76, 175, 80, 0.05)",
  },
  cellCountSeparator: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    alignSelf: "center",
    marginHorizontal: spacing.xs,
  },
  mediaButtonContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: colors.background.white25,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.3)",
  },
  mediaButtonText: {
    fontSize: typography.sizes.md,
    color: colors.text.white90,
    fontWeight: typography.weights.semibold,
  },
  mediaButtonDisabled: {
    opacity: 0.6,
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
  removeImageButton: {
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
  removeImageButtonText: {
    color: colors.text.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
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
  removeFileButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  removeFileButtonText: {
    color: colors.error,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
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
  removeLinkButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  removeLinkButtonText: {
    color: colors.error,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  modalOverlay: {
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
  modalContent: {
    backgroundColor: colors.background.white90,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  modalInput: {
    ...commonStyles.input,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  modalTextArea: {
    minHeight: 80,
  },
  linkTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  linkTypeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.background.white10,
    backgroundColor: colors.background.white25,
  },
  linkTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  linkTypeButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  linkTypeButtonTextActive: {
    color: colors.text.white,
  },
  modalButtonContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: colors.background.white25,
  },
  modalButtonSave: {
    backgroundColor: colors.primary,
  },
  modalButtonCancelText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
  },
  modalButtonSaveText: {
    fontSize: typography.sizes.md,
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
  },
});





