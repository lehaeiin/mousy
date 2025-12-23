// 테마 색상 및 공통 스타일 상수

export const colors = {
  // 그라데이션 배경 (오른쪽 하단 주황 원형 → 노랑 띠 → 회색)
  gradient: {
    start: "#8C7A76", // 회색 (왼쪽 상단, 먼 곳)
    middle: "#D6954C", // 노란 띠 (중간)
    end: "#FB6D1B", // 주황 (오른쪽 하단, 원형)
  },

  // 기본 색상
  primary: "#FF6B35",
  secondary: "#FF8C42",

  // 상태 색상
  success: "#34C759",
  error: "#FF3B30",
  warning: "#FF9500",
  info: "#007AFF",

  // 텍스트 색상
  text: {
    primary: "#1A1A1A",
    secondary: "rgba(0, 0, 0, 0.7)",
    tertiary: "rgba(0, 0, 0, 0.5)",
    white: "#FFFFFF",
    white90: "rgba(255, 255, 255, 0.9)",
    white70: "rgba(255, 255, 255, 0.7)",
  },

  // 배경 색상
  background: {
    white: "#F0F0F3",
    white90: "rgba(240, 240, 243, 0.9)",
    white25: "rgba(240, 240, 243, 0.25)",
    white15: "rgba(240, 240, 243, 0.15)",
    white10: "rgba(240, 240, 243, 0.1)",
  },

  // 상태 배지 색상
  status: {
    completed: "#34C759",
    "in-progress": "#007AFF",
    failed: "#FF3B30",
    planning: "#FF9500",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  round: 999,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 13,
    md: 14,
    base: 15,
    lg: 16,
    xl: 18,
    "2xl": 20,
    "3xl": 24,
    "4xl": 28,
    "5xl": 32,
  },
  weights: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
};
