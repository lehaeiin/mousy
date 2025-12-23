import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { Experiment } from "../types/experiment";
import { saveExperiment as saveExperimentToSupabase } from "./supabaseStorage";
import { getCurrentUser } from "./authService";

const SYNC_QUEUE_KEY = "@mousy:sync_queue";
const SYNC_INTERVAL = 30000; // 30초

// 동기화 큐 항목
interface SyncQueueItem {
  id: string;
  experiment: Experiment;
  createdAt: string;
  retryCount: number;
}

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
 * 네트워크 연결 상태 확인
 */
async function isOnline(): Promise<boolean> {
  try {
    const { error } = await supabase.from("projects").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
}

/**
 * 로컬에 실험 저장
 */
export async function saveExperimentLocally(
  experiment: Experiment
): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("로그인이 필요합니다.");
    }

    const key = `experiment_${experiment.id}`;
    const data = {
      ...experiment,
      synced: false,
      savedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("로컬 저장 실패:", error);
    throw error;
  }
}

/**
 * 로컬에서 실험 가져오기
 */
export async function getExperimentLocally(
  experimentId: string
): Promise<Experiment | null> {
  try {
    const key = `experiment_${experimentId}`;
    const data = await AsyncStorage.getItem(key);
    if (!data) return null;

    const parsed = JSON.parse(data);
    // Date 객체 복원 (안전하게 처리)
    if (parsed.date) {
      parsed.date = parsed.date instanceof Date ? parsed.date : new Date(parsed.date);
    } else {
      parsed.date = new Date();
    }
    if (parsed.createdAt) {
      parsed.createdAt = parsed.createdAt instanceof Date ? parsed.createdAt : new Date(parsed.createdAt);
    } else {
      parsed.createdAt = new Date();
    }
    if (parsed.updatedAt) {
      parsed.updatedAt = parsed.updatedAt instanceof Date ? parsed.updatedAt : new Date(parsed.updatedAt);
    } else {
      parsed.updatedAt = new Date();
    }
    if (parsed.startTime) {
      parsed.startTime = parsed.startTime instanceof Date ? parsed.startTime : new Date(parsed.startTime);
    }
    if (parsed.endTime) {
      parsed.endTime = parsed.endTime instanceof Date ? parsed.endTime : new Date(parsed.endTime);
    }

    return parsed as Experiment;
  } catch (error) {
    console.error("로컬 실험 가져오기 실패:", error);
    return null;
  }
}

/**
 * 로컬 실험 동기화 상태 업데이트
 */
export async function markExperimentAsSynced(
  experimentId: string
): Promise<void> {
  try {
    const key = `experiment_${experimentId}`;
    const data = await AsyncStorage.getItem(key);
    if (!data) return;

    const parsed = JSON.parse(data);
    parsed.synced = true;
    await AsyncStorage.setItem(key, JSON.stringify(parsed));
  } catch (error) {
    console.error("동기화 상태 업데이트 실패:", error);
  }
}

/**
 * 실험 동기화 상태 확인
 */
export async function isExperimentSynced(
  experimentId: string
): Promise<boolean> {
  try {
    const key = `experiment_${experimentId}`;
    const data = await AsyncStorage.getItem(key);
    if (!data) return true; // 로컬에 없으면 동기화된 것으로 간주

    const parsed = JSON.parse(data);
    return parsed.synced !== false;
  } catch (error) {
    console.error("동기화 상태 확인 실패:", error);
    return true;
  }
}

/**
 * 동기화 큐에 항목 추가
 */
async function addToSyncQueue(item: SyncQueueItem): Promise<void> {
  try {
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    const queue: SyncQueueItem[] = queueJson ? JSON.parse(queueJson) : [];
    
    // 중복 제거 (같은 ID가 있으면 제거 후 추가)
    const filtered = queue.filter((q) => q.id !== item.id);
    filtered.push(item);
    
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("동기화 큐에 추가 실패:", error);
  }
}

/**
 * 동기화 큐에서 항목 제거
 */
async function removeFromSyncQueue(itemId: string): Promise<void> {
  try {
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    const queue: SyncQueueItem[] = queueJson ? JSON.parse(queueJson) : [];
    const filtered = queue.filter((item) => item.id !== itemId);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("동기화 큐에서 제거 실패:", error);
  }
}

/**
 * 동기화 큐 가져오기
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  try {
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error("동기화 큐 가져오기 실패:", error);
    return [];
  }
}

/**
 * 실험 저장 (오프라인 지원)
 * 1. 로컬에 먼저 저장
 * 2. 온라인이면 Supabase에 저장
 * 3. 오프라인이면 동기화 큐에 추가
 */
export async function saveExperiment(
  experiment: Experiment
): Promise<{ synced: boolean; error?: Error }> {
  try {
    // 1. 로컬에 먼저 저장
    await saveExperimentLocally(experiment);

    // 2. 온라인 상태 확인
    const online = await isOnline();

    if (online) {
      // 온라인: Supabase에 저장
      try {
        await saveExperimentToSupabase(experiment);
        await markExperimentAsSynced(experiment.id);
        return { synced: true };
      } catch (error) {
        // 업로드 실패 시 큐에 추가
        console.error("Supabase 저장 실패, 큐에 추가:", error);
        await addToSyncQueue({
          id: experiment.id,
          experiment,
          createdAt: new Date().toISOString(),
          retryCount: 0,
        });
        return { synced: false, error: error as Error };
      }
    } else {
      // 오프라인: 큐에 추가
      await addToSyncQueue({
        id: experiment.id,
        experiment,
        createdAt: new Date().toISOString(),
        retryCount: 0,
      });
      return { synced: false };
    }
  } catch (error) {
    console.error("실험 저장 실패:", error);
    return { synced: false, error: error as Error };
  }
}

/**
 * 동기화 큐 처리 (네트워크 연결 시 호출)
 */
export async function processSyncQueue(): Promise<{
  success: number;
  failed: number;
}> {
  const queue = await getSyncQueue();
  if (queue.length === 0) {
    return { success: 0, failed: 0 };
  }

  const online = await isOnline();
  if (!online) {
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      // 최대 3회 재시도
      if (item.retryCount >= 3) {
        console.warn(`동기화 큐 항목 재시도 횟수 초과: ${item.id}`);
        await removeFromSyncQueue(item.id);
        failed++;
        continue;
      }

      await saveExperimentToSupabase(item.experiment);
      await markExperimentAsSynced(item.experiment.id);
      await removeFromSyncQueue(item.id);
      success++;
    } catch (error) {
      console.error(`동기화 큐 항목 처리 실패 (${item.id}):`, error);
      
      // 재시도 횟수 증가
      const updatedItem = {
        ...item,
        retryCount: item.retryCount + 1,
      };
      await removeFromSyncQueue(item.id);
      await addToSyncQueue(updatedItem);
      failed++;
    }
  }

  return { success, failed };
}

/**
 * 자동 동기화 시작 (30초마다 체크)
 */
let syncInterval: NodeJS.Timeout | null = null;

export function startAutoSync(): void {
  if (syncInterval) {
    return; // 이미 실행 중
  }

  syncInterval = setInterval(async () => {
    const online = await isOnline();
    if (online) {
      await processSyncQueue();
    }
  }, SYNC_INTERVAL);
}

/**
 * 자동 동기화 중지
 */
export function stopAutoSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

/**
 * 수동 동기화 (사용자가 버튼을 눌렀을 때)
 */
export async function manualSync(): Promise<{
  success: number;
  failed: number;
}> {
  return await processSyncQueue();
}




