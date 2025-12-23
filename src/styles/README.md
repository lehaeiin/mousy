# 스타일 가이드

React Native에서는 CSS 파일 대신 `StyleSheet.create()`를 사용합니다. 하지만 공통 스타일을 별도 파일로 관리할 수 있습니다.

## 파일 구조

```
src/styles/
├── theme.ts      # 색상, 간격, 폰트 등 상수 정의
├── common.ts     # 공통 스타일 정의
└── README.md     # 이 파일
```

## 사용 방법

### 1. 테마 상수 사용

```typescript
import { colors, spacing, typography } from "../styles/theme";

// 색상 사용
<View style={{ backgroundColor: colors.primary }} />

// 간격 사용
<View style={{ padding: spacing.lg }} />

// 폰트 크기 사용
<Text style={{ fontSize: typography.sizes.lg }} />
```

### 2. 공통 스타일 사용

```typescript
import { commonStyles } from "../styles/common";

// 카드 스타일
<View style={commonStyles.card}>
  <Text style={commonStyles.title}>제목</Text>
</View>

// 버튼 스타일
<TouchableOpacity style={commonStyles.buttonPrimary}>
  <Text style={commonStyles.buttonText}>저장</Text>
</TouchableOpacity>
```

### 3. 스타일 확장/조합

```typescript
import { StyleSheet } from "react-native";
import { commonStyles } from "../styles/common";
import { colors, spacing } from "../styles/theme";

const styles = StyleSheet.create({
  customCard: {
    ...commonStyles.card,
    backgroundColor: colors.background.white,
    padding: spacing.xxl,
  },
  
  customButton: {
    ...commonStyles.buttonPrimary,
    width: 200,
  },
});
```

## React vs React Native 스타일 차이

| React (웹) | React Native |
|-----------|--------------|
| `className="card"` | `style={commonStyles.card}` |
| CSS 파일 | `StyleSheet.create()` |
| `color: red` | `color: colors.error` |
| `padding: 16px` | `padding: spacing.lg` |
| `border-radius: 8px` | `borderRadius: borderRadius.md` |

## 장점

1. **일관성**: 모든 화면에서 동일한 색상/간격 사용
2. **유지보수**: 한 곳에서 수정하면 전체 적용
3. **재사용성**: 공통 스타일을 여러 곳에서 사용
4. **타입 안정성**: TypeScript로 타입 체크 가능

## 예시

### Before (인라인 스타일)
```typescript
<View style={{
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  borderRadius: 20,
  padding: 20,
  marginBottom: 16,
}}>
```

### After (공통 스타일 사용)
```typescript
<View style={commonStyles.card}>
```

또는

```typescript
<View style={[commonStyles.card, { marginBottom: spacing.xxl }]}>
```













