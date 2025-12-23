import { supabase } from "../lib/supabase";
import { Experiment } from "../types/experiment";
import { RealtimeChannel } from "@supabase/supabase-js";
import { dbToExperiment } from "./supabaseStorage";
import { Database } from "../lib/database.types";
import { getCurrentUser } from "./authService";

/**
 * 현재 로그인한 사용자 ID 가져오기
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    return user?.id || null;
  } catch (error) {
    console.error("사용자 ID 가져오기 실패:", error);
    return null;
  }
}

/**
 * 실험 변경사항 실시간 구독
 */
export function subscribeToExperiments(
  onInsert: (experiment: Experiment) => void,
  onUpdate: (experiment: Experiment) => void,
  onDelete: (experimentId: string) => void
): () => void {
  let channel: RealtimeChannel | null = null;

  const setupSubscription = async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn("사용자가 로그인하지 않았습니다. Realtime 구독을 건너뜁니다.");
      return;
    }

    // 기존 구독 제거
    if (channel) {
      await supabase.removeChannel(channel);
    }

    // 새 구독 생성
    channel = supabase
      .channel("experiments-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "experiments",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          try {
            const experiment = dbToExperiment(
              payload.new as Database["public"]["Tables"]["experiments"]["Row"]
            );
            onInsert(experiment);
          } catch (error) {
            console.error("INSERT 이벤트 처리 실패:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "experiments",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          try {
            const experiment = dbToExperiment(
              payload.new as Database["public"]["Tables"]["experiments"]["Row"]
            );
            onUpdate(experiment);
          } catch (error) {
            console.error("UPDATE 이벤트 처리 실패:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "experiments",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          try {
            onDelete(payload.old.id);
          } catch (error) {
            console.error("DELETE 이벤트 처리 실패:", error);
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("실험 변경사항 구독 오류");
        }
      });
  };

  setupSubscription();

  // 구독 해제 함수 반환
  return () => {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
  };
}

/**
 * 프로젝트별 실험 변경사항 실시간 구독
 */
export function subscribeToProjectExperiments(
  projectId: string,
  onInsert: (experiment: Experiment) => void,
  onUpdate: (experiment: Experiment) => void,
  onDelete: (experimentId: string) => void
): () => void {
  let channel: RealtimeChannel | null = null;

  const setupSubscription = async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn("사용자가 로그인하지 않았습니다. Realtime 구독을 건너뜁니다.");
      return;
    }

    // 기존 구독 제거
    if (channel) {
      await supabase.removeChannel(channel);
    }

    // 새 구독 생성
    channel = supabase
      .channel(`project-experiments-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "experiments",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          try {
            const experiment = dbToExperiment(
              payload.new as Database["public"]["Tables"]["experiments"]["Row"]
            );
            onInsert(experiment);
          } catch (error) {
            console.error("INSERT 이벤트 처리 실패:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "experiments",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          try {
            const experiment = dbToExperiment(
              payload.new as Database["public"]["Tables"]["experiments"]["Row"]
            );
            onUpdate(experiment);
          } catch (error) {
            console.error("UPDATE 이벤트 처리 실패:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "experiments",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          try {
            onDelete(payload.old.id);
          } catch (error) {
            console.error("DELETE 이벤트 처리 실패:", error);
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error(`프로젝트 ${projectId} 실험 변경사항 구독 오류`);
        }
      });
  };

  setupSubscription();

  // 구독 해제 함수 반환
  return () => {
    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }
  };
}




