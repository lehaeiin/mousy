// 공통 스타일 정의
import { StyleSheet } from "react-native";
import { colors, spacing, borderRadius, typography, shadows } from "./theme";

export const commonStyles = StyleSheet.create({
  // 카드 스타일
  card: {
    backgroundColor: colors.background.white90,
    borderRadius: borderRadius.xxl + 4, // 28px
    padding: spacing.xxxl - 4, // 28px
    marginBottom: spacing.lg,
    ...shadows.lg,
    overflow: "hidden",
  },

  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: borderRadius.xxl + 4,
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: "hidden",
  },

  // 글래스모피즘 컨테이너 (BlurView용) - 가운데는 거의 투명, 테두리만 글래스모피즘
  glassContainer: {
    borderRadius: borderRadius.xxl + 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  cardLarge: {
    backgroundColor: colors.background.white90,
    borderRadius: borderRadius.xxl + 4,
    padding: spacing.xxxl - 4,
    marginBottom: spacing.lg,
    ...shadows.xl,
    overflow: "hidden",
  },

  // 헤더 스타일
  header: {
    backgroundColor: colors.background.white15,
    padding: spacing.xl,
    paddingTop: 60,
  },

  // 제목 스타일
  title: {
    fontSize: typography.sizes["3xl"],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },

  titleLarge: {
    fontSize: typography.sizes["4xl"],
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    letterSpacing: -0.5,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // 매우 큰 숫자 표시 (온도 등)
  displayLarge: {
    fontSize: 120,
    fontWeight: "200" as const,
    color: colors.text.white,
    letterSpacing: -4,
    textAlign: "center",
  },

  // 큰 제목 (카드 헤더용)
  cardTitle: {
    fontSize: typography.sizes["4xl"] - 4, // 24px
    fontWeight: typography.weights.semibold,
    color: colors.text.white,
    letterSpacing: -0.3,
  },

  // 서브타이틀
  subtitle: {
    fontSize: typography.sizes.lg,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },

  subtitleWhite: {
    fontSize: typography.sizes.lg,
    color: colors.text.white90,
    fontWeight: typography.weights.medium,
  },

  // 라벨
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.white90,
    marginBottom: spacing.sm,
    letterSpacing: -0.2,
  },

  labelDark: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  input: {
    backgroundColor: "rgba(139, 69, 19, 0.25)",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: typography.sizes.lg,
    color: colors.text.white,
    // 매트 스타일: 그림자 제거, 단일 테두리
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  // 버튼 스타일
  button: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    ...shadows.md,
  },

  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg + 2,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  // 뉴모피즘 기본 버튼
  buttonNeumorphic: {
    paddingVertical: spacing.lg + 2,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    backgroundColor: "rgba(139, 69, 19, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.1)",
  },

  // 뉴모피즘 버튼 (Heat 버튼 스타일)
  neumorphicButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl - 2, // 18px
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.xl,
    flex: 1,
    backgroundColor: "rgba(139, 69, 19, 0.4)",
    // 뉴모피즘 효과: 내부 그림자와 외부 그림자
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    // 내부 하이라이트 효과를 위한 border
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.1)",
  },

  neumorphicButtonActive: {
    backgroundColor: "rgba(139, 69, 19, 0.7)",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  neumorphicButtonText: {
    fontSize: typography.sizes.base,
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.xs,
  },

  buttonText: {
    color: colors.text.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },

  // 배지 스타일
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.lg,
  },

  badgeText: {
    fontSize: typography.sizes.sm,
    color: colors.text.white,
    fontWeight: typography.weights.bold,
  },

  // 태그 스타일
  tag: {
    backgroundColor: "rgba(255, 107, 53, 0.15)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.xl,
  },

  tagText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },

  // FAB (Floating Action Button)
  fab: {
    position: "absolute",
    right: spacing.xl,
    bottom: spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background.white90,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.xl,
  },

  fabText: {
    fontSize: typography.sizes["5xl"],
    color: colors.primary,
    fontWeight: typography.weights.normal,
    lineHeight: 36,
  },

  // 섹션 제목
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.white90,
    marginBottom: spacing.lg,
    letterSpacing: -0.3,
  },

  sectionTitleDark: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    letterSpacing: -0.3,
  },

  // 빈 상태
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },

  emptyText: {
    fontSize: typography.sizes["2xl"],
    color: colors.text.white90,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },

  emptySubtext: {
    fontSize: typography.sizes.base,
    color: colors.text.white70,
  },

  // 푸터
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

  // 헤더 오른쪽 영역 (토글, 메뉴 등)
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  // 메뉴 버튼 (⋯)
  menuButton: {
    padding: spacing.xs,
  },

  menuDots: {
    fontSize: typography.sizes["3xl"],
    color: colors.text.white,
    fontWeight: typography.weights.bold,
  },

  // 서브타이틀 (작은 설명 텍스트)
  subtitleSmall: {
    fontSize: typography.sizes.lg,
    color: "rgba(240, 240, 243, 0.85)",
    marginTop: spacing.xs,
    textAlign: "center",
  },

  // 컨테이너 (중앙 정렬)
  centerContainer: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },

  // 상단 헤더 (뒤로가기 버튼 포함)
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: "transparent",
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

  // 로딩 컨테이너
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    textAlign: "center",
    fontSize: typography.sizes.xl,
    color: colors.text.white90,
    fontWeight: typography.weights.semibold,
  },
  errorText: {
    textAlign: "center",
    fontSize: typography.sizes.xl,
    color: colors.text.white90,
    fontWeight: typography.weights.semibold,
  },

  // 스크롤뷰 컨텐츠
  scrollContent: {
    padding: spacing.xl,
    paddingTop: 60,
    paddingBottom: 120,
  },
  scrollContentWithHeader: {
    padding: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 120,
  },
});
