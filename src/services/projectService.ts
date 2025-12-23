import { supabase } from "../lib/supabase";
import { Project } from "../types/project";
import { Database } from "../lib/database.types";
import { getCurrentUserId } from "../utils/dbHelpers";

export async function saveProject(project: Project): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("로그인이 필요합니다.");
    }

    const dbData: Database["public"]["Tables"]["projects"]["Insert"] = {
      id: project.id,
      name: project.name,
      description: project.description || null,
      created_at: project.createdAt.toISOString(),
      updated_at: project.updatedAt.toISOString(),
      user_id: userId,
    };

    const { error } = await supabase
      .from("projects")
      .upsert(dbData as any);
    if (error) throw error;
  } catch (error) {
    console.error("프로젝트 저장 실패:", error);
    throw error;
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (
      data?.map((p: Database["public"]["Tables"]["projects"]["Row"]) => ({
        id: p.id,
        name: p.name,
        description: p.description || undefined,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
      })) || []
    );
  } catch (error) {
    console.error("프로젝트 목록 가져오기 실패:", error);
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return null;
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return null;

    const project = data as Database["public"]["Tables"]["projects"]["Row"];
    return {
      id: project.id,
      name: project.name,
      description: project.description || undefined,
      createdAt: new Date(project.created_at),
      updatedAt: new Date(project.updated_at),
    };
  } catch (error) {
    console.error("프로젝트 가져오기 실패:", error);
    return null;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("로그인이 필요합니다.");
    }

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
  } catch (error) {
    console.error("프로젝트 삭제 실패:", error);
    throw error;
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
    } as any)) as { data: any[] | null; error: any };

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

    const projectIds = data.map((row: any) => row.id);
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



