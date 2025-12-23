import { ExperimentStage } from "../types/project";

export type ExpandedSections = {
  inVivo: {
    animalInfo: boolean;
    treatment: boolean;
    experimentalDesign: boolean;
    welfare: boolean;
    environment: boolean;
    sampling: boolean;
  };
  inVitro: {
    cellInfo: boolean;
    treatment: boolean;
    groups: boolean;
  };
  characterization: {
    treatment: boolean;
  };
};

export const INITIAL_EXPANDED_SECTIONS: ExpandedSections = {
  inVivo: {
    animalInfo: true,
    treatment: false,
    experimentalDesign: false,
    welfare: false,
    environment: false,
    sampling: false,
  },
  inVitro: {
    cellInfo: true,
    treatment: false,
    groups: false,
  },
  characterization: {
    treatment: false,
  },
};

const ALL_FALSE_SECTIONS = {
  inVivo: {
    animalInfo: false,
    treatment: false,
    experimentalDesign: false,
    welfare: false,
    environment: false,
    sampling: false,
  },
  inVitro: {
    cellInfo: false,
    treatment: false,
    groups: false,
  },
  characterization: {
    treatment: false,
  },
};

export function getExpandedSectionsForStage(
  stage: ExperimentStage | undefined
): ExpandedSections {
  if (!stage) {
    return INITIAL_EXPANDED_SECTIONS;
  }

  return {
    inVivo:
      stage === "in-vivo"
        ? INITIAL_EXPANDED_SECTIONS.inVivo
        : ALL_FALSE_SECTIONS.inVivo,
    inVitro:
      stage === "in-vitro"
        ? INITIAL_EXPANDED_SECTIONS.inVitro
        : ALL_FALSE_SECTIONS.inVitro,
    characterization:
      stage === "characterization"
        ? INITIAL_EXPANDED_SECTIONS.characterization
        : ALL_FALSE_SECTIONS.characterization,
  };
}





