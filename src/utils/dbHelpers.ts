import { getCurrentUser } from "../services/authService";
import { Experiment, AttachedFile, ExternalLink } from "../types/experiment";
import { Database } from "../lib/database.types";

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    return user?.id || null;
  } catch (error) {
    console.error("사용자 ID 가져오기 실패:", error);
    return null;
  }
}

export function serializeFiles(
  files: Experiment["files"]
): Database["public"]["Tables"]["experiments"]["Insert"]["files"] {
  if (!files || files.length === 0) return [];
  return files.map((file) => ({
    id: file.id,
    name: file.name,
    url: file.url,
    size: file.size ?? null,
    mimeType: file.mimeType ?? null,
    uploadedAt: file.uploadedAt.toISOString(),
    isLocal: file.isLocal ?? null,
  }));
}

export function serializeLinks(
  links: Experiment["links"]
): Database["public"]["Tables"]["experiments"]["Insert"]["links"] {
  if (!links || links.length === 0) return [];
  return links.map((link) => ({
    id: link.id,
    title: link.title,
    url: link.url,
    type: link.type ?? null,
    description: link.description ?? null,
  }));
}

function serializeDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serializeDates);
  if (typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      result[key] = serializeDates(obj[key]);
    }
    return result;
  }
  return obj;
}

export function serializeInVivoMetadata(
  metadata: Experiment["inVivoMetadata"]
): Database["public"]["Tables"]["experiments"]["Insert"]["in_vivo_metadata"] {
  if (!metadata) return null;
  return serializeDates(metadata) as any;
}

export function serializeInVitroMetadata(
  metadata: Experiment["inVitroMetadata"]
): Database["public"]["Tables"]["experiments"]["Insert"]["in_vitro_metadata"] {
  if (!metadata) return null;
  return serializeDates(metadata) as any;
}

export function serializeCharacterizationMetadata(
  metadata: Experiment["characterizationMetadata"]
): Database["public"]["Tables"]["experiments"]["Insert"]["characterization_metadata"] {
  if (!metadata) return null;
  return serializeDates(metadata) as any;
}

export function deserializeFiles(
  files: Database["public"]["Tables"]["experiments"]["Row"]["files"]
): Experiment["files"] {
  if (!files || !Array.isArray(files) || files.length === 0) return undefined;
  return files.map((file: any) => ({
    id: file.id,
    name: file.name,
    url: file.url,
    size: file.size ?? undefined,
    mimeType: file.mimeType ?? undefined,
    uploadedAt: new Date(file.uploadedAt),
    isLocal: file.isLocal ?? undefined,
  }));
}

export function deserializeLinks(
  links: Database["public"]["Tables"]["experiments"]["Row"]["links"]
): Experiment["links"] {
  if (!links || !Array.isArray(links) || links.length === 0) return undefined;
  return links.map((link: any) => ({
    id: link.id,
    title: link.title,
    url: link.url,
    type: link.type ?? undefined,
    description: link.description ?? undefined,
  }));
}

function deserializeDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string" && /^\d{4}-\d{2}-\d{2}T/.test(obj)) {
    return new Date(obj);
  }
  if (Array.isArray(obj)) return obj.map(deserializeDates);
  if (typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      result[key] = deserializeDates(obj[key]);
    }
    return result;
  }
  return obj;
}

export function deserializeInVivoMetadata(
  metadata: Database["public"]["Tables"]["experiments"]["Row"]["in_vivo_metadata"]
): Experiment["inVivoMetadata"] {
  if (!metadata) return undefined;
  return deserializeDates(metadata) as Experiment["inVivoMetadata"];
}

export function deserializeInVitroMetadata(
  metadata: Database["public"]["Tables"]["experiments"]["Row"]["in_vitro_metadata"]
): Experiment["inVitroMetadata"] {
  if (!metadata) return undefined;
  return deserializeDates(metadata) as Experiment["inVitroMetadata"];
}

export function deserializeCharacterizationMetadata(
  metadata: Database["public"]["Tables"]["experiments"]["Row"]["characterization_metadata"]
): Experiment["characterizationMetadata"] {
  if (!metadata) return undefined;
  return deserializeDates(metadata) as Experiment["characterizationMetadata"];
}





