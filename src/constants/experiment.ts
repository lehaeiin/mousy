import { ExperimentStage, ExperimentMethod } from "../types/project";

export const EXPERIMENT_METHODS: { key: ExperimentMethod; label: string }[] =
  [
    { key: "DLS", label: "DLS" },
    { key: "TEM", label: "TEM" },
    { key: "PCR", label: "PCR" },
    { key: "Western", label: "Western" },
    { key: "ELISA", label: "ELISA" },
    { key: "Flow cytometry", label: "Flow cytometry" },
    { key: "Electroporation", label: "Electroporation" },
    { key: "Other", label: "기타" },
  ];

export const EXPERIMENT_STAGES: {
  key: ExperimentStage;
  label: string;
  icon: string;
}[] = [
  { key: "characterization", label: "characterization", icon: "🔬" },
  { key: "in-vitro", label: "in vitro", icon: "🧪" },
  { key: "in-vivo", label: "in vivo", icon: "🐭" },
];

export const STATUS_OPTIONS = [
  { key: "planning", label: "계획" },
  { key: "in-progress", label: "진행중" },
  { key: "completed", label: "완료" },
  { key: "failed", label: "실패" },
] as const;





