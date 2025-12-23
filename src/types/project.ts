// 프로젝트 타입 정의
export interface Project {
  id: string;
  name: string; // "siRNA 엑소좀", "LMP", "설파살라진" 등
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 실험 단계 (프로젝트 내부 구조)
export type ExperimentStage =
  | "characterization" // characterization (물질 특성)
  | "in-vitro" // in vitro (세포 실험)
  | "in-vivo"; // in vivo (마우스 실험)

// 실험 방법/기법
export type ExperimentMethod =
  | "DLS"
  | "TEM"
  | "PCR"
  | "Western"
  | "ELISA"
  | "Flow cytometry"
  | "Electroporation"
  | "Other";

// 실험 조건 (유연한 키-값 구조 + 카테고리)
export interface ExperimentCondition {
  category: string; // "Electroporation", "Sample", "Buffer" 등 (비교용)
  key: string; // "Voltage", "Exosome amount", "siRNA 농도" 등
  value: string | number; // 값
  unit?: string; // "V", "μg", "pM", "회" 등
}
