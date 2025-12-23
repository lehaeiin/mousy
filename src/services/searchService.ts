import { supabase } from "../lib/supabase";
import { Experiment } from "../types/experiment";
import { ExperimentStage, ExperimentMethod } from "../types/project";
import { Project } from "../types/project";
import { Database } from "../lib/database.types";
import { getCurrentUserId } from "../utils/dbHelpers";
import { dbToExperiment } from "./experimentService";

export interface SearchOptions {
  query?: string;
  projectName?: string;
  stage?: ExperimentStage;
  tags?: string[];
  limit?: number;
}

interface SearchExperimentsResult {
  id: string;
  project_id: string;
  title: string;
  date: string;
  notes: string;
  tags: string[];
  stage: string;
  method: string | null;
  status: string;
  created_at: string;
  relevance: number;
}

interface SearchProjectsResult {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  relevance: number;
}

export async function searchExperiments(query: string): Promise<Experiment[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    const lowerQuery = query.toLowerCase();

    const { data, error } = await supabase
      .from("experiments")
      .select("*")
      .or(`title.ilike.%${query}%,notes.ilike.%${query}%,tags.cs.{${query}}`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const filtered =
      data?.filter(
        (exp: Database["public"]["Tables"]["experiments"]["Row"]) => {
          const titleMatch = exp.title?.toLowerCase().includes(lowerQuery);
          const notesMatch = exp.notes?.toLowerCase().includes(lowerQuery);
          const tagsMatch = exp.tags?.some((tag: string) =>
            tag.toLowerCase().includes(lowerQuery)
          );
          const sampleMatch = exp.sample_id?.toLowerCase().includes(lowerQuery);
          return titleMatch || notesMatch || tagsMatch || sampleMatch;
        }
      ) || [];

    return filtered.map(dbToExperiment);
  } catch (error) {
    console.error("실험 검색 실패:", error);
    return [];
  }
}

export async function searchExperimentsByProjectAndMethod(
  query: string
): Promise<Experiment[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    const parts = query.trim().split(/\s+/);
    if (parts.length < 2) {
      return searchExperiments(query);
    }

    const projectName = parts[0];
    const methodName = parts.slice(1).join(" ").toUpperCase();

    const { data: projects } = await supabase
      .from("projects")
      .select("id")
      .ilike("name", `%${projectName}%`);

    if (!projects || projects.length === 0) {
      return [];
    }

    const projectIds = projects.map(
      (p: Database["public"]["Tables"]["projects"]["Row"]) => p.id
    );

    const methodMap: { [key: string]: ExperimentMethod } = {
      DLS: "DLS",
      TEM: "TEM",
      PCR: "PCR",
      WESTERN: "Western",
      ELISA: "ELISA",
      "FLOW CYTOMETRY": "Flow cytometry",
      FLOW: "Flow cytometry",
      ELECTROPORATION: "Electroporation",
      OTHER: "Other",
    };

    const method = methodMap[methodName] || (methodName as ExperimentMethod);

    const { data, error } = await supabase
      .from("experiments")
      .select("*")
      .in("project_id", projectIds)
      .eq("method", method)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data?.map(dbToExperiment) || [];
  } catch (error) {
    console.error("프로젝트+방법 검색 실패:", error);
    return [];
  }
}

async function fallbackSearchExperiments(
  options: SearchOptions
): Promise<Experiment[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    let query = supabase.from("experiments").select("*, projects(*)");

    if (options.projectName) {
      const { data: projects } = await supabase
        .from("projects")
        .select("id")
        .ilike("name", `%${options.projectName}%`);

      if (projects && projects.length > 0) {
        const projectIds = (
          projects as Database["public"]["Tables"]["projects"]["Row"][]
        ).map((p) => p.id);
        query = query.in("project_id", projectIds);
      } else {
        return [];
      }
    }

    if (options.stage) {
      query = query.eq("stage", options.stage);
    }

    if (options.query) {
      query = query.or(
        `title.ilike.%${options.query}%,notes.ilike.%${options.query}%,sample_id.ilike.%${options.query}%`
      );
    }

    query = query
      .order("created_at", { ascending: false })
      .limit(options.limit || 100);

    const { data, error } = await query;
    if (error) throw error;

    let filtered = data || [];

    if (options.tags && options.tags.length > 0) {
      filtered = filtered.filter((item: any) => {
        const exp = item as Database["public"]["Tables"]["experiments"]["Row"];
        if (!exp.tags || exp.tags.length === 0) return false;
        return options.tags!.some((filterTag) =>
          exp.tags!.some(
            (expTag) => expTag.toLowerCase() === filterTag.toLowerCase()
          )
        );
      });
    }

    if (options.query) {
      const lowerQuery = options.query.toLowerCase();
      filtered = filtered.filter((item: any) => {
        const exp = item as Database["public"]["Tables"]["experiments"]["Row"];
        const titleMatch = exp.title?.toLowerCase().includes(lowerQuery);
        const notesMatch = exp.notes?.toLowerCase().includes(lowerQuery);
        const sampleMatch = exp.sample_id?.toLowerCase().includes(lowerQuery);
        const tagsMatch = exp.tags?.some((tag: string) =>
          tag.toLowerCase().includes(lowerQuery)
        );
        return titleMatch || notesMatch || sampleMatch || tagsMatch;
      });
    }

    return filtered.map((item: any) => dbToExperiment(item));
  } catch (error) {
    console.error("Fallback 검색 실패:", error);
    return [];
  }
}

export async function advancedSearchExperiments(
  options: SearchOptions
): Promise<Experiment[]> {
  try {
    const { query, projectName, stage, tags, limit = 100 } = options;

    const { data, error } = (await supabase.rpc("search_experiments", {
      search_query: query || null,
      project_name_filter: projectName || null,
      stage_filter: stage || null,
      tag_filter: tags && tags.length > 0 ? tags : null,
      limit_count: limit,
    } as any)) as { data: SearchExperimentsResult[] | null; error: any };

    if (error) {
      return fallbackSearchExperiments(options);
    }

    if (!data || data.length === 0) {
      return [];
    }

    const experimentIds = data.map((row: SearchExperimentsResult) => row.id);
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    const { data: expDataArray, error: expError } = await supabase
      .from("experiments")
      .select("*")
      .in("id", experimentIds);

    if (expError) {
      console.error("실험 데이터 가져오기 실패:", expError);
      return fallbackSearchExperiments(options);
    }

    if (!expDataArray || expDataArray.length === 0) {
      return [];
    }

    const projectIds = [
      ...new Set(
        (
          expDataArray as Database["public"]["Tables"]["experiments"]["Row"][]
        ).map((exp) => exp.project_id)
      ),
    ];

    const { data: projectDataArray } = await supabase
      .from("projects")
      .select("*")
      .in("id", projectIds);

    const typedProjectDataArray = (projectDataArray ||
      []) as Database["public"]["Tables"]["projects"]["Row"][];
    const projectMap = new Map(typedProjectDataArray.map((p) => [p.id, p]));

    const experiments: Experiment[] = [];
    const typedExpDataArray =
      expDataArray as Database["public"]["Tables"]["experiments"]["Row"][];
    const expDataMap = new Map(typedExpDataArray.map((exp) => [exp.id, exp]));

    for (const row of data) {
      const expData = expDataMap.get(row.id);
      if (
        expData &&
        projectMap.has(
          (expData as Database["public"]["Tables"]["experiments"]["Row"])
            .project_id
        )
      ) {
        experiments.push(
          dbToExperiment(
            expData as Database["public"]["Tables"]["experiments"]["Row"]
          )
        );
      }
    }

    return experiments;
  } catch (error) {
    console.error("고급 실험 검색 실패:", error);
    return fallbackSearchExperiments(options);
  }
}

export async function searchProjects(query: string): Promise<Project[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    const { data, error } = (await supabase.rpc("search_projects", {
      search_query: query || null,
      limit_count: 100,
    } as any)) as { data: SearchProjectsResult[] | null; error: any };

    if (error) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("projects")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(100);

      if (fallbackError) throw fallbackError;

      return (
        fallbackData?.map(
          (p: Database["public"]["Tables"]["projects"]["Row"]) => ({
            id: p.id,
            name: p.name,
            description: p.description || undefined,
            createdAt: new Date(p.created_at),
            updatedAt: new Date(p.updated_at),
          })
        ) || []
      );
    }

    if (!data || data.length === 0) {
      return [];
    }

    const projectIds = data.map((row: SearchProjectsResult) => row.id);
    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .in("id", projectIds);

    if (projectsError) throw projectsError;

    return (
      projectsData?.map(
        (p: Database["public"]["Tables"]["projects"]["Row"]) => ({
          id: p.id,
          name: p.name,
          description: p.description || undefined,
          createdAt: new Date(p.created_at),
          updatedAt: new Date(p.updated_at),
        })
      ) || []
    );
  } catch (error) {
    console.error("프로젝트 검색 실패:", error);
    return [];
  }
}

export async function searchExperimentsByTags(
  tags: string[]
): Promise<Experiment[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    if (!tags || tags.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from("experiments")
      .select("*")
      .contains("tags", tags)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data?.map(dbToExperiment) || [];
  } catch (error) {
    console.error("태그별 실험 검색 실패:", error);
    return [];
  }
}

export async function searchExperimentsByStage(
  stage: ExperimentStage,
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
      .eq("stage", stage)
      .order("created_at", { ascending: false });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data?.map(dbToExperiment) || [];
  } catch (error) {
    console.error("단계별 실험 검색 실패:", error);
    return [];
  }
}

export async function searchExperimentsByProjectName(
  projectName: string
): Promise<Experiment[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id")
      .ilike("name", `%${projectName}%`);

    if (projectsError) throw projectsError;

    if (!projects || projects.length === 0) {
      return [];
    }

    const projectIds = (
      projects as Database["public"]["Tables"]["projects"]["Row"][]
    ).map((p) => p.id);

    const { data, error } = await supabase
      .from("experiments")
      .select("*")
      .in("project_id", projectIds)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data?.map(dbToExperiment) || [];
  } catch (error) {
    console.error("프로젝트명으로 실험 검색 실패:", error);
    return [];
  }
}

