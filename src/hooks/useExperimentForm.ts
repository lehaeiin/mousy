import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { getExperiment } from "../services/supabaseStorage";
import {
  Experiment,
  ExperimentDraft,
  InVivoMetadata,
  InVitroMetadata,
  CharacterizationMetadata,
} from "../types/experiment";
import { ExperimentStage, ExperimentMethod } from "../types/project";

const createEmptyDraft = (): ExperimentDraft => ({
  title: `실험 ${new Date().toLocaleDateString("ko-KR")}`,
  notes: "",
  status: "in-progress",
  stage: undefined,
  method: undefined,
  otherMethod: undefined,
  tags: [],
  images: [],
  files: [],
  links: [],
  mouseVendor: undefined,
  strain: undefined,
  ageWeeks: undefined,
  diet: undefined,
  runNumber: undefined,
  inVivoMetadata: undefined,
  inVitroMetadata: undefined,
  characterizationMetadata: undefined,
});

export function useExperimentForm(experimentId?: string) {
  const [draft, setDraft] = useState<ExperimentDraft>(createEmptyDraft);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (experimentId) {
      loadExperiment();
    } else {
      setDraft(createEmptyDraft());
    }
  }, [experimentId]);

  const loadExperiment = async () => {
    if (!experimentId) return;
    try {
      const experiment = await getExperiment(experimentId);
      if (experiment) {
        setDraft({
          title: experiment.title,
          notes: experiment.notes,
          status: experiment.status,
          stage: experiment.stage || undefined,
          method: experiment.method,
          otherMethod: experiment.otherMethod || undefined,
          tags: experiment.tags,
          images: experiment.images || [],
          files: experiment.files || [],
          links: experiment.links || [],
          mouseVendor: experiment.mouseVendor || undefined,
          strain: experiment.strain || undefined,
          ageWeeks: experiment.ageWeeks?.toString() || undefined,
          diet: experiment.diet || undefined,
          runNumber: experiment.runNumber?.toString() || undefined,
          inVivoMetadata: experiment.inVivoMetadata,
          inVitroMetadata: experiment.inVitroMetadata,
          characterizationMetadata: experiment.characterizationMetadata,
        });
      }
    } catch (error) {
      console.error("실험 로드 실패:", error);
      Alert.alert("오류", "실험을 불러올 수 없습니다.");
    }
  };

  useEffect(() => {
    if (!draft.stage) return;

    if (draft.stage === "in-vivo") {
      setDraft((d) => ({
        ...d,
        inVitroMetadata: undefined,
        characterizationMetadata: undefined,
      }));
    } else if (draft.stage === "in-vitro") {
      setDraft((d) => ({
        ...d,
        inVivoMetadata: undefined,
        characterizationMetadata: undefined,
      }));
    } else if (draft.stage === "characterization") {
      setDraft((d) => ({
        ...d,
        inVivoMetadata: undefined,
        inVitroMetadata: undefined,
      }));
    }
  }, [draft.stage]);

  const generateTitle = useCallback((): string => {
    const parts: string[] = [];
    if (draft.method) {
      if (draft.method === "Other" && draft.otherMethod?.trim()) {
        parts.push(draft.otherMethod.trim());
      } else {
        parts.push(draft.method);
      }
    }
    if (draft.stage === "in-vivo") {
      if (draft.runNumber) parts.push(`${draft.runNumber}차`);
      if (draft.strain) parts.push(draft.strain);
      if (draft.ageWeeks) parts.push(`${draft.ageWeeks}주령`);
    }
    const dateStr = new Date().toLocaleDateString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
    });
    parts.push(dateStr);
    return parts.length > 1 ? parts.join(" / ") : `실험 ${dateStr}`;
  }, [draft]);

  useEffect(() => {
    if (!draft.title.trim()) {
      setDraft((prev) => ({ ...prev, title: generateTitle() }));
    }
  }, [draft.stage, draft.method, draft.otherMethod, generateTitle]);

  const buildExperiment = useCallback(
    (projectId: string, experimentId?: string): Experiment => {
      return {
        id: experimentId || Date.now().toString(),
        projectId,
        stage: draft.stage!,
        method: draft.method,
        otherMethod:
          draft.method === "Other" && draft.otherMethod?.trim()
            ? draft.otherMethod.trim()
            : undefined,
        title: draft.title.trim() || generateTitle(),
        date: new Date(),
        notes: draft.notes.trim(),
        images: draft.images,
        files: draft.files.length > 0 ? draft.files : undefined,
        links: draft.links.length > 0 ? draft.links : undefined,
        tags: draft.tags,
        status: draft.status,
        mouseVendor:
          draft.stage === "in-vivo" && draft.mouseVendor
            ? draft.mouseVendor
            : undefined,
        strain:
          draft.stage === "in-vivo" && draft.strain ? draft.strain : undefined,
        ageWeeks:
          draft.stage === "in-vivo" && draft.ageWeeks
            ? parseInt(draft.ageWeeks, 10)
            : undefined,
        diet: draft.stage === "in-vivo" && draft.diet ? draft.diet : undefined,
        runNumber:
          draft.stage === "in-vivo" && draft.runNumber
            ? parseInt(draft.runNumber, 10)
            : undefined,
        inVivoMetadata:
          draft.stage === "in-vivo"
            ? {
                ...draft.inVivoMetadata,
                animalInfo: {
                  ...draft.inVivoMetadata?.animalInfo,
                  vendor:
                    draft.inVivoMetadata?.animalInfo?.vendor ||
                    draft.mouseVendor ||
                    undefined,
                  strain:
                    draft.inVivoMetadata?.animalInfo?.strain ||
                    draft.strain ||
                    undefined,
                  ageWeeks:
                    draft.inVivoMetadata?.animalInfo?.ageWeeks ||
                    (draft.ageWeeks ? parseInt(draft.ageWeeks, 10) : undefined),
                },
                environment: {
                  ...draft.inVivoMetadata?.environment,
                  food:
                    draft.inVivoMetadata?.environment?.food ||
                    draft.diet ||
                    undefined,
                },
                experimentalDesign: draft.inVivoMetadata?.experimentalDesign,
                mouseVendor: draft.mouseVendor || undefined,
                strain: draft.strain || undefined,
                ageWeeks: draft.ageWeeks
                  ? parseInt(draft.ageWeeks, 10)
                  : undefined,
                diet: draft.diet || undefined,
                runNumber: draft.runNumber
                  ? parseInt(draft.runNumber, 10)
                  : undefined,
              }
            : undefined,
        inVitroMetadata:
          draft.stage === "in-vitro" ? draft.inVitroMetadata : undefined,
        characterizationMetadata:
          draft.stage === "characterization"
            ? draft.characterizationMetadata
            : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    [draft, generateTitle]
  );

  const addTag = useCallback(() => {
    if (tagInput.trim() && !draft.tags.includes(tagInput.trim())) {
      setDraft((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  }, [tagInput, draft.tags]);

  const removeTag = useCallback(
    (tagToRemove: string) => {
      setDraft((prev) => ({
        ...prev,
        tags: prev.tags.filter((tag) => tag !== tagToRemove),
      }));
    },
    []
  );

  return {
    draft,
    setDraft,
    title: draft.title,
    setTitle: (title: string) =>
      setDraft((prev) => ({ ...prev, title })),
    notes: draft.notes,
    setNotes: (notes: string) =>
      setDraft((prev) => ({ ...prev, notes })),
    tags: draft.tags,
    tagInput,
    setTagInput,
    stage: draft.stage,
    setStage: (stage: ExperimentStage | undefined) => {
      setDraft((prev) => ({ ...prev, stage }));
    },
    method: draft.method,
    setMethod: (method: ExperimentMethod | undefined) =>
      setDraft((prev) => ({ ...prev, method })),
    otherMethod: draft.otherMethod || "",
    setOtherMethod: (otherMethod: string) =>
      setDraft((prev) => ({ ...prev, otherMethod })),
    status: draft.status,
    setStatus: (status: Experiment["status"]) =>
      setDraft((prev) => ({ ...prev, status })),
    images: draft.images,
    setImages: (images: string[] | ((prev: string[]) => string[])) =>
      setDraft((prev) => ({
        ...prev,
        images: typeof images === "function" ? images(prev.images) : images,
      })),
    files: draft.files,
    setFiles: (
      files: typeof draft.files | ((prev: typeof draft.files) => typeof draft.files)
    ) =>
      setDraft((prev) => ({
        ...prev,
        files: typeof files === "function" ? files(prev.files) : files,
      })),
    links: draft.links,
    setLinks: (
      links: typeof draft.links | ((prev: typeof draft.links) => typeof draft.links)
    ) =>
      setDraft((prev) => ({
        ...prev,
        links: typeof links === "function" ? links(prev.links) : links,
      })),
    mouseVendor: draft.mouseVendor || "",
    setMouseVendor: (mouseVendor: string) =>
      setDraft((prev) => ({ ...prev, mouseVendor })),
    strain: draft.strain || "",
    setStrain: (strain: string) =>
      setDraft((prev) => ({ ...prev, strain })),
    ageWeeks: draft.ageWeeks || "",
    setAgeWeeks: (ageWeeks: string) =>
      setDraft((prev) => ({ ...prev, ageWeeks })),
    diet: draft.diet || "",
    setDiet: (diet: string) =>
      setDraft((prev) => ({ ...prev, diet })),
    runNumber: draft.runNumber || "",
    setRunNumber: (runNumber: string) =>
      setDraft((prev) => ({ ...prev, runNumber })),
    inVivoMetadata: draft.inVivoMetadata || {},
    setInVivoMetadata: (metadata: InVivoMetadata) =>
      setDraft((prev) => ({ ...prev, inVivoMetadata: metadata })),
    inVitroMetadata: draft.inVitroMetadata || {},
    setInVitroMetadata: (metadata: InVitroMetadata) =>
      setDraft((prev) => ({ ...prev, inVitroMetadata: metadata })),
    characterizationMetadata: draft.characterizationMetadata || {},
    setCharacterizationMetadata: (metadata: CharacterizationMetadata) =>
      setDraft((prev) => ({ ...prev, characterizationMetadata: metadata })),
    generateTitle,
    buildExperiment,
    addTag,
    removeTag,
  };
}
