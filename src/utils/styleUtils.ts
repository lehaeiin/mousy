import { StyleSheet, ViewStyle, TextStyle, ImageStyle, StyleProp } from "react-native";

type Style = ViewStyle | TextStyle | ImageStyle | false | null | undefined | 0 | "";

/**
 * React Native용 clsx 유틸리티 함수
 * 조건부로 스타일을 결합할 수 있습니다.
 * 
 * @example
 * // 기본 사용
 * style={cn(styles.button, isActive && styles.active)}
 * 
 * @example
 * // 여러 조건
 * style={cn(
 *   styles.button,
 *   isActive && styles.active,
 *   isDisabled && styles.disabled,
 *   customStyle
 * )}
 * 
 * @example
 * // 객체 형태
 * style={cn(styles.button, {
 *   [styles.active]: isActive,
 *   [styles.disabled]: isDisabled,
 * })}
 * 
 * @example
 * // 배열 형태
 * style={cn([styles.button, styles.large], isActive && styles.active)}
 */
export function cn<T extends Style = Style>(
  ...args: (Style | Style[] | Record<string, boolean>)[]
): StyleProp<T> {
  const result: Style[] = [];

  for (const arg of args) {
    if (!arg && arg !== 0) continue;

    if (Array.isArray(arg)) {
      result.push(...arg.filter((item) => item !== false && item !== null && item !== undefined && item !== "" && item !== 0));
    } else if (typeof arg === "object" && !Array.isArray(arg)) {
      // 객체 형태: { [styles.active]: isActive }
      for (const [key, value] of Object.entries(arg)) {
        if (value) {
          result.push(key as any);
        }
      }
    } else {
      const styleArg = arg as Style;
      if (styleArg !== false && styleArg !== null && styleArg !== undefined && styleArg !== "" && styleArg !== 0) {
        result.push(styleArg);
      }
    }
  }

  return result.length === 0 ? undefined : (result.length === 1 ? result[0] : result) as StyleProp<T>;
}

/**
 * clsx와 동일한 이름의 별칭 (선택사항)
 */
export const clsx = cn;

/**
 * 조건부로 단일 스타일을 반환합니다.
 * 
 * @example
 * style={conditionalStyle(isActive, styles.active, styles.inactive)}
 */
export function conditionalStyle<T extends Style>(
  condition: boolean,
  trueStyle: T,
  falseStyle?: T
): T | undefined {
  return condition ? trueStyle : falseStyle;
}

/**
 * 여러 조건에 따라 스타일을 반환합니다.
 * 
 * @example
 * style={switchStyle(
 *   status,
 *   {
 *     active: styles.active,
 *     inactive: styles.inactive,
 *     pending: styles.pending,
 *   },
 *   styles.default
 * )}
 */
export function switchStyle<T extends Style>(
  value: string | number,
  cases: Record<string | number, T>,
  defaultStyle?: T
): T | undefined {
  return cases[value] ?? defaultStyle;
}

