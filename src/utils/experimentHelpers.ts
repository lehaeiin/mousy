import {
  InVivoMetadata,
  InVitroMetadata,
  CharacterizationMetadata,
} from "../types/experiment";

/**
 * 숫자 입력 파싱 유틸리티
 * 빈 문자열이면 undefined, 유효한 숫자면 숫자, 그 외는 무시
 */
export function parseNumberInput(
  text: string,
  callback: (value?: number) => void
) {
  if (text === "") {
    callback(undefined);
    return;
  }
  const num = Number(text);
  if (!isNaN(num)) {
    callback(num);
  }
}

/**
 * 제네릭 메타데이터 업데이트 헬퍼
 * 모든 메타데이터 타입에 대해 재사용 가능한 업데이트 함수
 */
export function updateMetadata<T extends Record<string, any>>(
  current: T,
  key: keyof T,
  value: Partial<T[keyof T]>
): T {
  return {
    ...current,
    [key]: {
      ...(current[key] as any),
      ...value,
    },
  };
}

/**
 * InVivoMetadata 업데이트 헬퍼 (하위 호환성 유지)
 * @deprecated updateMetadata를 사용하세요
 */
export function updateInVivoMetadata<K extends keyof InVivoMetadata>(
  current: InVivoMetadata,
  key: K,
  value: Partial<InVivoMetadata[K]>
): InVivoMetadata {
  return updateMetadata(current, key, value);
}

/**
 * InVitroMetadata 업데이트 헬퍼 (하위 호환성 유지)
 * @deprecated updateMetadata를 사용하세요
 */
export function updateInVitroMetadata<K extends keyof InVitroMetadata>(
  current: InVitroMetadata,
  key: K,
  value: Partial<InVitroMetadata[K]>
): InVitroMetadata {
  return updateMetadata(current, key, value);
}

/**
 * CharacterizationMetadata 업데이트 헬퍼 (하위 호환성 유지)
 * @deprecated updateMetadata를 사용하세요
 */
export function updateCharacterizationMetadata<
  K extends keyof CharacterizationMetadata
>(
  current: CharacterizationMetadata,
  key: K,
  value: Partial<CharacterizationMetadata[K]>
): CharacterizationMetadata {
  return updateMetadata(current, key, value);
}
