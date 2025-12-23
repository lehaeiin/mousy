import { supabase } from "../lib/supabase";
import { Experiment } from "../types/experiment";
import { ExperimentStage, ExperimentMethod } from "../types/project";
import { Database } from "../lib/database.types";
import {
  getCurrentUserId,
  serializeFiles,
  serializeLinks,
  serializeInVivoMetadata,
  serializeInVitroMetadata,
  serializeCharacterizationMetadata,
  deserializeFiles,
  deserializeLinks,
  deserializeInVivoMetadata,
  deserializeInVitroMetadata,
  deserializeCharacterizationMetadata,
} from "../utils/dbHelpers";

async function experimentToDb(
  experiment: Experiment
): Promise<Database["public"]["Tables"]["experiments"]["Insert"]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("로그인이 필요합니다.");
  }

  const dateValue =
    experiment.date instanceof Date
      ? experiment.date
      : experiment.date
      ? new Date(experiment.date)
      : new Date();

  const createdAt =
    experiment.createdAt instanceof Date
      ? experiment.createdAt
      : experiment.createdAt
      ? new Date(experiment.createdAt)
      : new Date();

  const updatedAt =
    experiment.updatedAt instanceof Date
      ? experiment.updatedAt
      : experiment.updatedAt
      ? new Date(experiment.updatedAt)
      : new Date();

  return {
    id: experiment.id,
    project_id: experiment.projectId,
    title: experiment.title,
    date: dateValue.toISOString(),
    notes: experiment.notes || "",
    images: experiment.images || [],
    tags: experiment.tags || [],
    protocol: experiment.protocol || null,
    stage: experiment.stage,
    method: experiment.method || null,
    status: experiment.status,
    sample_id: experiment.sampleId || null,
    experiment_type: experiment.experimentType || null,
    start_time: experiment.startTime?.toISOString() || null,
    end_time: experiment.endTime?.toISOString() || null,
    file_links: experiment.fileLinks || [],
    files: serializeFiles(experiment.files),
    links: serializeLinks(experiment.links),
    mouse_vendor: experiment.mouseVendor || null,
    strain: experiment.strain || null,
    age_weeks: experiment.ageWeeks || null,
    diet: experiment.diet || null,
    run_number: experiment.runNumber || null,
    in_vivo_metadata: serializeInVivoMetadata(experiment.inVivoMetadata),
    in_vitro_metadata: serializeInVitroMetadata(experiment.inVitroMetadata),
    characterization_metadata: serializeCharacterizationMetadata(
      experiment.characterizationMetadata
    ),
    created_at: createdAt.toISOString(),
    updated_at: updatedAt.toISOString(),
    user_id: userId,
  } as Database["public"]["Tables"]["experiments"]["Insert"];
}

export function dbToExperiment(
  data: Database["public"]["Tables"]["experiments"]["Row"]
): Experiment {
  return {
    id: data.id,
    projectId: data.project_id,
    title: data.title,
    date: new Date(data.date),
    notes: data.notes || "",
    images: data.images || [],
    tags: data.tags || [],
    protocol: data.protocol || undefined,
    stage: data.stage,
    method: data.method || undefined,
    status: data.status,
    sampleId: data.sample_id || undefined,
    experimentType: data.experiment_type || undefined,
    startTime: data.start_time ? new Date(data.start_time) : undefined,
    endTime: data.end_time ? new Date(data.end_time) : undefined,
    fileLinks: data.file_links || [],
    files: deserializeFiles(data.files),
    links: deserializeLinks(data.links),
    mouseVendor: data.mouse_vendor || undefined,
    strain: data.strain || undefined,
    ageWeeks: data.age_weeks || undefined,
    diet: data.diet || undefined,
    runNumber: data.run_number || undefined,
    inVivoMetadata: deserializeInVivoMetadata(data.in_vivo_metadata),
    inVitroMetadata: deserializeInVitroMetadata(data.in_vitro_metadata),
    characterizationMetadata: deserializeCharacterizationMetadata(
      (data as any).characterization_metadata
    ),
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function saveExperiment(experiment: Experiment): Promise<void> {
  try {
    const dbData = await experimentToDb({
      ...experiment,
      updatedAt: new Date(),
    });

    const { error } = await supabase
      .from("experiments")
      .upsert(dbData as any);
    if (error) throw error;
  } catch (error) {
    console.error("실험 저장 실패:", error);
    throw error;
  }
}

export async function getExperiments(): Promise<Experiment[]> {
  try {
    const { data, error } = await supabase
      .from("experiments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data?.map(dbToExperiment) || [];
  } catch (error) {
    console.error("실험 목록 가져오기 실패:", error);
    return [];
  }
}

export async function getExperiment(id: string): Promise<Experiment | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return null;
    }

    const { data, error } = await supabase
      .from("experiments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return dbToExperiment(data);
  } catch (error) {
    console.error("실험 가져오기 실패:", error);
    return null;
  }
}

export async function deleteExperiment(id: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("로그인이 필요합니다.");
    }

    const { error } = await supabase.from("experiments").delete().eq("id", id);
    if (error) throw error;
  } catch (error) {
    console.error("실험 삭제 실패:", error);
    throw error;
  }
}

export async function getExperimentsByProject(
  projectId: string
): Promise<Experiment[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from("experiments")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data?.map(dbToExperiment) || [];
  } catch (error) {
    console.error("프로젝트별 실험 가져오기 실패:", error);
    return [];
  }
}

export async function getExperimentsByProjectAndStage(
  projectId: string,
  stage: ExperimentStage
): Promise<Experiment[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from("experiments")
      .select("*")
      .eq("project_id", projectId)
      .eq("stage", stage)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data?.map(dbToExperiment) || [];
  } catch (error) {
    console.error("프로젝트+단계별 실험 가져오기 실패:", error);
    return [];
  }
}

export async function getExperimentsByProjectAndMethod(
  projectId: string,
  method: ExperimentMethod
): Promise<Experiment[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from("experiments")
      .select("*")
      .eq("project_id", projectId)
      .eq("method", method)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data?.map(dbToExperiment) || [];
  } catch (error) {
    console.error("프로젝트+방법별 실험 가져오기 실패:", error);
    return [];
  }
}

export async function getFailedExperiments(
  projectId?: string
): Promise<Experiment[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    let query = supabase
      .from("experiments")
      .select("*")
      .eq("status", "failed")
      .order("created_at", { ascending: false });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data?.map(dbToExperiment) || [];
  } catch (error) {
    console.error("실패한 실험 가져오기 실패:", error);
    return [];
  }
}

export async function filterExperimentsByDate(
  startDate?: Date,
  endDate?: Date
): Promise<Experiment[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    let query = supabase.from("experiments").select("*");

    if (startDate) {
      query = query.gte("date", startDate.toISOString());
    }
    if (endDate) {
      query = query.lte("date", endDate.toISOString());
    }

    const { data, error } = await query.order("date", { ascending: false });
    if (error) throw error;
    return data?.map(dbToExperiment) || [];
  } catch (error) {
    console.error("날짜 필터링 실패:", error);
    return [];
  }
}



