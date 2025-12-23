/**
 * styleUtils 사용 예시
 * 
 * 이 파일은 예시용이며 실제로 사용되지 않습니다.
 * 프로젝트의 다른 파일에서 이 패턴을 참고하세요.
 */

import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { cn, conditionalStyle, switchStyle } from "./styleUtils";
import { colors, spacing, borderRadius } from "../styles/theme";

const styles = StyleSheet.create({
  button: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  buttonActive: {
    backgroundColor: colors.success,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonLarge: {
    padding: spacing.lg,
  },
  text: {
    color: colors.text.white,
  },
  textError: {
    color: colors.error,
  },
});

// 예시 1: 기본 조건부 스타일
function Example1({ isActive }: { isActive: boolean }) {
  return (
    <TouchableOpacity
      style={cn(styles.button, isActive && styles.buttonActive)}
    >
      <Text style={styles.text}>버튼</Text>
    </TouchableOpacity>
  );
}

// 예시 2: 여러 조건
function Example2({
  isActive,
  isDisabled,
  isLarge,
}: {
  isActive: boolean;
  isDisabled: boolean;
  isLarge: boolean;
}) {
  return (
    <TouchableOpacity
      style={cn(
        styles.button,
        isActive && styles.buttonActive,
        isDisabled && styles.buttonDisabled,
        isLarge && styles.buttonLarge
      )}
    >
      <Text style={styles.text}>버튼</Text>
    </TouchableOpacity>
  );
}

// 예시 3: 객체 형태 (clsx와 동일)
function Example3({
  isActive,
  isDisabled,
}: {
  isActive: boolean;
  isDisabled: boolean;
}) {
  return (
    <TouchableOpacity
      style={cn(styles.button, {
        [styles.buttonActive]: isActive,
        [styles.buttonDisabled]: isDisabled,
      })}
    >
      <Text style={styles.text}>버튼</Text>
    </TouchableOpacity>
  );
}

// 예시 4: 배열과 조건 결합
function Example4({ isActive }: { isActive: boolean }) {
  return (
    <TouchableOpacity
      style={cn([styles.button, styles.buttonLarge], isActive && styles.buttonActive)}
    >
      <Text style={styles.text}>버튼</Text>
    </TouchableOpacity>
  );
}

// 예시 5: conditionalStyle 사용
function Example5({ isActive }: { isActive: boolean }) {
  return (
    <TouchableOpacity
      style={cn(
        styles.button,
        conditionalStyle(isActive, styles.buttonActive, styles.buttonDisabled)
      )}
    >
      <Text style={styles.text}>버튼</Text>
    </TouchableOpacity>
  );
}

// 예시 6: switchStyle 사용 (상태에 따라 다른 스타일)
function Example6({ status }: { status: "active" | "inactive" | "pending" }) {
  return (
    <View
      style={cn(
        styles.button,
        switchStyle(status, {
          active: styles.buttonActive,
          inactive: styles.buttonDisabled,
          pending: { opacity: 0.7 },
        })
      )}
    >
      <Text style={styles.text}>상태: {status}</Text>
    </View>
  );
}

// 예시 7: 실제 사용 패턴 (기존 코드 개선)
function Example7({
  selectedValue,
  value,
}: {
  selectedValue?: string;
  value: string;
}) {
  const isSelected = selectedValue === value;

  return (
    <TouchableOpacity
      style={cn(
        styles.button,
        isSelected && styles.buttonActive
      )}
    >
      <Text
        style={cn(
          styles.text,
          isSelected && styles.textError
        )}
      >
        {value}
      </Text>
    </TouchableOpacity>
  );
}

// 기존 방식 (Before)
function BeforeExample({ isActive }: { isActive: boolean }) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isActive && styles.buttonActive,
      ]}
    >
      <Text style={styles.text}>버튼</Text>
    </TouchableOpacity>
  );
}

// 개선된 방식 (After) - 더 읽기 쉽고 일관성 있음
function AfterExample({ isActive }: { isActive: boolean }) {
  return (
    <TouchableOpacity
      style={cn(styles.button, isActive && styles.buttonActive)}
    >
      <Text style={styles.text}>버튼</Text>
    </TouchableOpacity>
  );
}





