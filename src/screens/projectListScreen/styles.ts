import { StyleSheet } from "react-native";
import { commonStyles } from "../../styles/common";
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from "../../styles/theme";

export const styles = StyleSheet.create({
  listContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  topContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  searchContainer: {
    flex: 1,
    position: "relative",
  },
  searchInputBlur: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  searchInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: typography.sizes.lg,
    color: colors.text.white,
    paddingRight: 50,
  },
  searchLoader: {
    position: "absolute",
    right: spacing.lg,
    top: spacing.lg,
  },
  sectionHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionHeaderFirst: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
    marginBottom: 0,
  },
  experimentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  experimentTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    marginBottom: spacing.xs,
  },
  experimentRunNumber: {
    fontSize: typography.sizes.sm,
    color: colors.text.white90,
    fontWeight: typography.weights.medium,
  },
  stageBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.white25,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  stageIcon: {
    fontSize: typography.sizes.sm,
    marginRight: spacing.xs,
  },
  stageText: {
    fontSize: typography.sizes.sm,
    color: colors.text.white90,
    fontWeight: typography.weights.medium,
  },
  experimentNotes: {
    fontSize: typography.sizes.base,
    color: colors.text.white90,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  tag: {
    ...commonStyles.tag,
  },
  tagText: {
    ...commonStyles.tagText,
  },
  moreTagsText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  experimentDate: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  experimentCardBlur: {
    ...commonStyles.glassContainer,
    marginBottom: spacing.md,
  },
  experimentCard: {
    ...commonStyles.glassCard,
    padding: spacing.lg,
    marginBottom: 0,
  },
  emptyContainer: {
    ...commonStyles.emptyContainer,
  },
  emptyText: {
    ...commonStyles.emptyText,
  },
  emptySubtext: {
    ...commonStyles.emptySubtext,
  },
  fab: {
    ...commonStyles.fab,
  },
  fabText: {
    ...commonStyles.fabText,
  },
  profileButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  profileIcon: {
    width: 32,
    height: 32,
  },
});



