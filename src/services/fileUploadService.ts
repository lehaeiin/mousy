import { supabase } from "../lib/supabase";
import { getCurrentUser } from "./authService";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { AttachedFile } from "../types/experiment";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UPLOAD_QUEUE_KEY = "@mousy:upload_queue";

// 오프라인 업로드 큐 항목
interface UploadQueueItem {
  id: string;
  experimentId: string;
  type: "image" | "file";
  localUri: string;
  fileName: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
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
 * 네트워크 연결 상태 확인 (간단한 방법)
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
 * 오프라인 큐에 항목 추가
 */
async function addToUploadQueue(item: UploadQueueItem): Promise<void> {
  try {
    const queueJson = await AsyncStorage.getItem(UPLOAD_QUEUE_KEY);
    const queue: UploadQueueItem[] = queueJson ? JSON.parse(queueJson) : [];
    queue.push(item);
    await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("업로드 큐에 추가 실패:", error);
  }
}

/**
 * 오프라인 큐에서 항목 제거
 */
async function removeFromUploadQueue(itemId: string): Promise<void> {
  try {
    const queueJson = await AsyncStorage.getItem(UPLOAD_QUEUE_KEY);
    const queue: UploadQueueItem[] = queueJson ? JSON.parse(queueJson) : [];
    const filtered = queue.filter((item) => item.id !== itemId);
    await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("업로드 큐에서 제거 실패:", error);
  }
}

/**
 * 오프라인 큐 가져오기
 */
async function getUploadQueue(): Promise<UploadQueueItem[]> {
  try {
    const queueJson = await AsyncStorage.getItem(UPLOAD_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error("업로드 큐 가져오기 실패:", error);
    return [];
  }
}

/**
 * Access Token 가져오기
 */
async function getAccessToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("인증 토큰을 가져올 수 없습니다. 다시 로그인해주세요.");
  }

  return session.access_token;
}

/**
 * 버킷 존재 여부 확인
 */
async function ensureBucketExists(bucketName: string): Promise<boolean> {
  try {
    // 버킷 목록 조회로 존재 여부 확인
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error(`버킷 목록 조회 실패:`, error);
      return false;
    }

    const bucketExists = data?.some((bucket) => bucket.name === bucketName);

    if (!bucketExists) {
      console.error(
        `⚠️ Storage 버킷 '${bucketName}'이 존재하지 않습니다. ` +
          `Supabase 대시보드에서 버킷을 생성해주세요.`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(`버킷 확인 실패:`, error);
    return false;
  }
}

/**
 * 이미지 업로드 (Supabase Storage)
 */
export async function uploadImage(
  experimentId: string,
  imageUri: string
): Promise<AttachedFile> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("로그인이 필요합니다.");
  }

  const online = await isOnline();

  // 파일 정보 읽기
  const fileInfo = await FileSystem.getInfoAsync(imageUri);
  if (!fileInfo.exists) {
    throw new Error("이미지 파일을 찾을 수 없습니다.");
  }

  const fileName = `${experimentId}_${Date.now()}.jpg`;
  const storagePath = `${userId}/${experimentId}/${fileName}`;

  if (!online) {
    // 오프라인: 큐에 추가하고 로컬 파일 반환
    const queueItem: UploadQueueItem = {
      id: Date.now().toString(),
      experimentId,
      type: "image",
      localUri: imageUri,
      fileName,
      mimeType: "image/jpeg",
      size: fileInfo.size,
      createdAt: new Date().toISOString(),
    };

    await addToUploadQueue(queueItem);

    return {
      id: queueItem.id,
      name: fileName,
      url: imageUri, // 로컬 경로
      size: fileInfo.size,
      mimeType: "image/jpeg",
      uploadedAt: new Date(),
      isLocal: true,
    };
  }

  // 온라인: Supabase에 업로드
  try {
    const bucketName = "experiment-images";

    // Access Token 가져오기
    const accessToken = await getAccessToken();

    // Supabase URL에서 프로젝트 ID 추출
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
    if (!supabaseUrl) {
      throw new Error("Supabase URL이 설정되지 않았습니다.");
    }

    // FileSystem.uploadAsync를 사용하여 직접 업로드 (Blob 불필요)
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${storagePath}`;

    const result = await FileSystem.uploadAsync(uploadUrl, imageUri, {
      httpMethod: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "image/jpeg",
      },
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });

    if (result.status !== 200 && result.status !== 201) {
      const errorMessage = result.body || "알 수 없는 오류";
      throw new Error(`이미지 업로드 실패 (${result.status}): ${errorMessage}`);
    }

    // Public bucket이므로 public URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(storagePath);

    if (!publicUrl) {
      return {
        id: Date.now().toString(),
        name: fileName,
        url: storagePath, // 경로만 저장
        size: fileInfo.size,
        mimeType: "image/jpeg",
        uploadedAt: new Date(),
        isLocal: false,
      };
    }

    return {
      id: Date.now().toString(),
      name: fileName,
      url: publicUrl, // Public URL 사용
      size: fileInfo.size,
      mimeType: "image/jpeg",
      uploadedAt: new Date(),
      isLocal: false,
    };
  } catch (error) {
    // 업로드 실패 시 오프라인 큐에 추가
    const queueItem: UploadQueueItem = {
      id: Date.now().toString(),
      experimentId,
      type: "image",
      localUri: imageUri,
      fileName,
      mimeType: "image/jpeg",
      size: fileInfo.size,
      createdAt: new Date().toISOString(),
    };

    await addToUploadQueue(queueItem);

    return {
      id: queueItem.id,
      name: fileName,
      url: imageUri,
      size: fileInfo.size,
      mimeType: "image/jpeg",
      uploadedAt: new Date(),
      isLocal: true,
    };
  }
}

/**
 * 카메라에서 이미지 촬영
 */
export async function takePhoto(): Promise<string | null> {
  try {
    // 카메라 권한 요청
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      throw new Error("카메라 권한이 필요합니다.");
    }

    // 카메라 열기
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    throw error;
  }
}

/**
 * 갤러리에서 이미지 선택
 */
export async function pickImage(): Promise<string | null> {
  try {
    // 갤러리 권한 요청
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      throw new Error("갤러리 권한이 필요합니다.");
    }

    // 이미지 선택
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    throw error;
  }
}

/**
 * 파일 업로드 (Supabase Storage)
 * React Native에서는 DocumentPicker 대신 expo-file-system 사용
 */
export async function uploadFile(
  experimentId: string,
  fileUri: string,
  fileName: string,
  mimeType?: string
): Promise<AttachedFile> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("로그인이 필요합니다.");
  }

  const online = await isOnline();

  // 파일 정보 읽기
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (!fileInfo.exists) {
    throw new Error("파일을 찾을 수 없습니다.");
  }

  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${userId}/${experimentId}/${sanitizedFileName}`;

  if (!online) {
    // 오프라인: 큐에 추가하고 로컬 파일 반환
    const queueItem: UploadQueueItem = {
      id: Date.now().toString(),
      experimentId,
      type: "file",
      localUri: fileUri,
      fileName: sanitizedFileName,
      mimeType: mimeType || "application/octet-stream",
      size: fileInfo.size,
      createdAt: new Date().toISOString(),
    };

    await addToUploadQueue(queueItem);

    return {
      id: queueItem.id,
      name: sanitizedFileName,
      url: fileUri,
      size: fileInfo.size,
      mimeType: mimeType || "application/octet-stream",
      uploadedAt: new Date(),
      isLocal: true,
    };
  }

  // 온라인: Supabase에 업로드
  try {
    const bucketName = "experiment-files";

    // Access Token 가져오기
    const accessToken = await getAccessToken();

    // Supabase URL에서 프로젝트 ID 추출
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
    if (!supabaseUrl) {
      throw new Error("Supabase URL이 설정되지 않았습니다.");
    }

    // FileSystem.uploadAsync를 사용하여 직접 업로드 (Blob 불필요)
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${storagePath}`;

    const result = await FileSystem.uploadAsync(uploadUrl, fileUri, {
      httpMethod: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": mimeType || "application/octet-stream",
      },
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });

    if (result.status !== 200 && result.status !== 201) {
      const errorMessage = result.body || "알 수 없는 오류";
      throw new Error(`파일 업로드 실패 (${result.status}): ${errorMessage}`);
    }

    // Private bucket이므로 signed URL 생성 (5분 유효기간)
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from(bucketName)
        .createSignedUrl(storagePath, 60 * 5); // 5분

    if (signedUrlError) {
      return {
        id: Date.now().toString(),
        name: sanitizedFileName,
        url: storagePath,
        size: fileInfo.size,
        mimeType: mimeType || "application/octet-stream",
        uploadedAt: new Date(),
        isLocal: false,
      };
    }

    return {
      id: Date.now().toString(),
      name: sanitizedFileName,
      url: signedUrlData.signedUrl, // Signed URL 사용
      size: fileInfo.size,
      mimeType: mimeType || "application/octet-stream",
      uploadedAt: new Date(),
      isLocal: false,
    };
  } catch (error) {
    // 업로드 실패 시 오프라인 큐에 추가
    const queueItem: UploadQueueItem = {
      id: Date.now().toString(),
      experimentId,
      type: "file",
      localUri: fileUri,
      fileName: sanitizedFileName,
      mimeType: mimeType || "application/octet-stream",
      size: fileInfo.size,
      createdAt: new Date().toISOString(),
    };

    await addToUploadQueue(queueItem);

    return {
      id: queueItem.id,
      name: sanitizedFileName,
      url: fileUri,
      size: fileInfo.size,
      mimeType: mimeType || "application/octet-stream",
      uploadedAt: new Date(),
      isLocal: true,
    };
  }
}

/**
 * 오프라인 큐 처리 (네트워크 연결 시 호출)
 */
export async function processUploadQueue(): Promise<{
  success: number;
  failed: number;
}> {
  const queue = await getUploadQueue();
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
      if (item.type === "image") {
        await uploadImage(item.experimentId, item.localUri);
      } else {
        await uploadFile(
          item.experimentId,
          item.localUri,
          item.fileName,
          item.mimeType
        );
      }
      await removeFromUploadQueue(item.id);
      success++;
    } catch (error) {
      console.error(`업로드 큐 항목 처리 실패 (${item.id}):`, error);
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Signed URL 생성 (Private bucket용)
 * 파일 경로로부터 signed URL을 생성합니다. 유효기간은 5분입니다.
 *
 * @param filePath Storage 경로 (예: "user_id/experiment_id/file.csv")
 * @param bucketName 버킷 이름 (기본값: "experiment-files")
 * @param expiresIn 만료 시간(초) (기본값: 300 = 5분)
 * @returns signed URL 또는 null
 */
export async function getSignedUrl(
  filePath: string,
  bucketName: string = "experiment-files",
  expiresIn: number = 60 * 5
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error("Signed URL 생성 실패:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Signed URL 생성 중 오류:", error);
    return null;
  }
}

/**
 * 이미지 파일의 Signed URL 생성
 *
 * @deprecated experiment-images는 Public bucket이므로 이 함수를 사용하지 마세요.
 * Public URL은 getPublicUrl()로 직접 생성하거나, 업로드 시 자동으로 생성됩니다.
 *
 * @param filePath Storage 경로 (예: "user_id/experiment_id/image.jpg")
 * @param expiresIn 만료 시간(초) (기본값: 300 = 5분)
 * @returns signed URL 또는 null
 */
export async function getImageSignedUrl(
  filePath: string,
  expiresIn: number = 60 * 5
): Promise<string | null> {
  return null;
}

/**
 * 파일 선택 (expo-document-picker 사용)
 * iOS의 "파일" 앱, Android의 파일 관리자 등에서 파일을 선택할 수 있습니다.
 */
export async function pickFile(): Promise<{
  uri: string;
  name: string;
  mimeType?: string;
} | null> {
  try {
    // expo-document-picker를 사용하여 파일 선택
    // iOS에서는 "파일" 앱, Android에서는 파일 관리자가 열립니다
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*", // 모든 파일 타입 허용
      copyToCacheDirectory: true, // 캐시 디렉토리에 복사 (필수)
      multiple: false, // 단일 파일만 선택
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const file = result.assets[0];

    return {
      uri: file.uri,
      name: file.name || "file",
      mimeType: file.mimeType || undefined,
    };
  } catch (error) {
    console.error("파일 선택 실패:", error);
    throw error;
  }
}
