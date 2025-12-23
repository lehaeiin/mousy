import { ExperimentStage, ExperimentMethod } from "./project";

// 1. 동물 개체 기본 정보
export interface AnimalBasicInfo {
  animalId?: string; // 동물 ID
  cageId?: string; // 케이지 ID
  strain?: string; // 종/계통 (C57BL/6J 등)
  sex?: "male" | "female" | "unknown"; // 성별
  ageWeeks?: number; // 생후 주령/나이
  ageDays?: number; // 생후 일령
  weightInitial?: number; // 실험 전 체중 (g)
  weightFinal?: number; // 실험 후 체중 (g)
  weightDuring?: number[]; // 실험 중 체중 추적 (g, 날짜별)
  genotype?: string; // 유전형
  isTransgenic?: boolean; // 트랜스제닉 여부
  isKnockout?: boolean; // 노크아웃 여부
  knockoutType?: string; // 노크아웃 항목 (자유 입력)
  vendor?: string; // 공급업체 (Jackson Lab 등)
}

// 2. 처치(약물·물질) 관련 정보
export interface TreatmentInfo {
  substances?: Array<{
    substanceName?: string; // 투여 물질 이름 (약품/화합물/세포/바이러스 등)
    cat?: string; // Cat#
    manufacturer?: string; // 제조회사
  }>;
  dose?: number; // 용량
  doseUnit?: string; // 용량 단위 (mg/kg, μg/kg 등)
  volume?: number; // 투여 부피 (μL, mL 등)
  volumeUnit?: string; // 부피 단위
  vehicle?: string; // 용매 (saline, PBS, DMSO 등)
  route?: "oral" | "ip" | "iv" | "sc" | "im" | "topical" | "other"; // 투여 경로 (경구, 복강, 정맥, 피하, 근육, 국소, 기타)
  routeOther?: string; // 기타 경로 상세
  frequency?: string; // 투여 빈도/스케줄 (예: "1회/일", "3회/주")
  administeredBy?: string; // 투여 담당자
  startDate?: Date; // 투여 시작 날짜·시간
  endDate?: Date; // 투여 종료 날짜·시간
  // 레거시 호환용 (하위 호환성 유지)
  substanceName?: string;
  cat?: string;
  manufacturer?: string;
}

// 3. 실험 디자인 및 그룹 정보
export interface ExperimentalDesign {
  groups?: Array<{
    groupNumber: number; // 그룹 번호 (1, 2, 3...)
    groupName?: string; // 그룹명 (편집 가능)
    n?: number; // 그룹별 마리 수
    characteristics?: string; // 그룹 특징 (자유 입력) / in-vitro에서는 처리조건
  }>;
}

// 4. 환경·실험 조건 메타데이터
export interface EnvironmentalMetadata {
  food?: string; // 사료 종류
}

// in vivo 실험 상세 메타데이터 (통합)
export interface InVivoMetadata {
  animalInfo?: AnimalBasicInfo;
  treatment?: TreatmentInfo;
  experimentalDesign?: ExperimentalDesign;
  environment?: EnvironmentalMetadata;

  // 레거시 호환용 (기존 필드 유지)
  mouseVendor?: string;
  strain?: string;
  ageWeeks?: number;
  diet?: string;
  runNumber?: number;
}

// in vitro 실험 상세 메타데이터
export interface InVitroMetadata {
  cellInfo?: {
    cellName?: string; // Cell line name
    origin?: string; // Origin/Cell type (어디서 유래했는지/세포 타입)
    vendor?: string; // Purchase source/Vendor (구매처/판매처)
    media?: string; // Culture media (배지)
    wellType?: string; // Well type (어떤 well 사용했는지)
  };
  cellCount?: {
    coefficient?: number; // n in n*10^n
    exponent?: number; // exponent in n*10^n
  };
  treatment?: TreatmentInfo; // 물질템플릿
  experimentalDesign?: ExperimentalDesign; // in-vivo와 동일한 구조 사용
}

// characterization 실험 상세 메타데이터
export interface CharacterizationMetadata {
  treatment?: TreatmentInfo; // 물질템플릿
}

// 첨부 파일 정보
export interface AttachedFile {
  id: string; // 고유 ID
  name: string; // 파일명
  url: string; // Supabase Storage URL 또는 로컬 경로
  size?: number; // 파일 크기 (bytes)
  mimeType?: string; // MIME 타입 (예: "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  uploadedAt: Date; // 업로드 시간
  isLocal?: boolean; // 로컬 파일인지 (오프라인 큐에 있는 경우)
}

// 외부 링크 정보
export interface ExternalLink {
  id: string; // 고유 ID
  title: string; // 링크 제목
  url: string; // 링크 URL
  type?: "code" | "document" | "data" | "other"; // 링크 타입
  description?: string; // 설명
}

// 실험 드래프트 타입 (편집 중인 상태)
export type ExperimentDraft = {
  title: string;
  notes: string;
  status: "planning" | "in-progress" | "completed" | "failed";
  stage?: ExperimentStage;
  method?: ExperimentMethod;
  otherMethod?: string;
  tags: string[];
  images: string[];
  files: AttachedFile[];
  links: ExternalLink[];
  // In-vivo 레거시 필드 (호환성 유지)
  mouseVendor?: string;
  strain?: string;
  ageWeeks?: string; // 편집 시에는 string으로 관리
  diet?: string;
  runNumber?: string; // 편집 시에는 string으로 관리
  // Stage별 메타데이터
  inVivoMetadata?: InVivoMetadata;
  inVitroMetadata?: InVitroMetadata;
  characterizationMetadata?: CharacterizationMetadata;
};

export interface Experiment {
  id: string;
  title: string;
  date: Date;
  notes: string; // 자유 형식 메모 (실험 중 빠르게 기록)
  images: string[];
  tags: string[];
  protocol?: string; // 프로토콜 템플릿 ID

  // 프로젝트 구조
  projectId: string; // 필수: 어떤 프로젝트인지
  stage: ExperimentStage; // 필수: "characterization" | "in-vitro" | "in-vivo"
  method?: ExperimentMethod; // 옵션: "DLS", "TEM", "PCR" 등 (아직 정하지 않은 경우도 많음)
  otherMethod?: string; // method가 "Other"일 때 자유 입력된 방법명

  // In-vivo 전용 상세 메타데이터
  inVivoMetadata?: InVivoMetadata;

  // In-vitro 전용 상세 메타데이터
  inVitroMetadata?: InVitroMetadata;

  // Characterization 전용 상세 메타데이터
  characterizationMetadata?: CharacterizationMetadata;

  // In-vivo 레거시 필드 (호환성 유지)
  mouseVendor?: string; // 마우스 공급업체
  strain?: string; // C57BL/6J 등
  ageWeeks?: number; // 8주령 등
  diet?: string; // 사료 종류
  runNumber?: number; // 회차 (1차, 2차, 3차...)

  // 상태 및 메타데이터
  status: "planning" | "in-progress" | "completed" | "failed"; // 실패도 추적
  sampleId?: string;
  experimentType?: string; // 레거시 호환용

  // 시간 추적
  startTime?: Date;
  endTime?: Date;

  // 파일 및 링크
  fileLinks?: string[]; // 외부 파일 링크 (레거시 호환)
  files?: AttachedFile[]; // 첨부된 파일 목록
  links?: ExternalLink[]; // 외부 링크 목록 (Colab, GitHub 등)

  // 타임스탬프
  createdAt: Date;
  updatedAt: Date;
}
