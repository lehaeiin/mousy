import { useState } from "react";
import { Alert } from "react-native";
import { AttachedFile, ExternalLink } from "../types/experiment";
import {
  uploadImage,
  takePhoto,
  pickImage,
  uploadFile,
  pickFile,
} from "../services/fileUploadService";

type UseMediaAttachmentsParams = {
  images: string[];
  setImages: (images: string[] | ((prev: string[]) => string[])) => void;
  files: AttachedFile[];
  setFiles: (files: AttachedFile[] | ((prev: AttachedFile[]) => AttachedFile[])) => void;
  links: ExternalLink[];
  setLinks: (links: ExternalLink[] | ((prev: ExternalLink[]) => ExternalLink[])) => void;
  experimentId?: string;
};

export function useMediaAttachments({
  images,
  setImages,
  files,
  setFiles,
  links,
  setLinks,
  experimentId,
}: UseMediaAttachmentsParams) {
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkType, setLinkType] = useState<
    "code" | "document" | "data" | "other"
  >("code");
  const [linkDescription, setLinkDescription] = useState("");

  const handleAddImage = async (source: "camera" | "gallery") => {
    let imageUri: string | null = null;
    try {
      setIsImageLoading(true);
      imageUri =
        source === "camera" ? await takePhoto() : await pickImage();
      if (!imageUri) {
        setIsImageLoading(false);
        return;
      }

      setImages((prev) => [...prev, imageUri!]);

      const currentExperimentId = experimentId || Date.now().toString();
      const uploadedFile = await uploadImage(currentExperimentId, imageUri);

      setImages((prev) =>
        prev.map((url) => (url === imageUri ? uploadedFile.url : url))
      );
      // 이미지는 files 배열에 추가하지 않음 (이미지와 파일을 구분하기 위해)
    } catch (error: any) {
      if (imageUri) {
        setImages((prev) => prev.filter((url) => url !== imageUri));
      }
      Alert.alert("오류", error.message || "이미지 추가에 실패했습니다.");
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleAddFile = async () => {
    try {
      const file = await pickFile();
      if (!file) return;

      const currentExperimentId = experimentId || Date.now().toString();
      const uploadedFile = await uploadFile(
        currentExperimentId,
        file.uri,
        file.name,
        file.mimeType
      );

      setFiles((prev) => [...prev, uploadedFile]);
    } catch (error: any) {
      Alert.alert("오류", error.message || "파일 추가에 실패했습니다.");
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const fileToRemove = files.find((f) => f.id === fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (fileToRemove) {
      setImages((prev) => prev.filter((url) => url !== fileToRemove.url));
    }
  };

  const handleRemoveImage = (index: number) => {
    const imageUrl = images[index];
    if (!imageUrl) return;

    const relatedFile = files.find((f) => f.url === imageUrl);
    if (relatedFile) {
      handleRemoveFile(relatedFile.id);
    } else {
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleAddLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) {
      Alert.alert("알림", "제목과 URL을 입력해주세요.");
      return;
    }

    const newLink: ExternalLink = {
      id: Date.now().toString(),
      title: linkTitle.trim(),
      url: linkUrl.trim(),
      type: linkType,
      description: linkDescription.trim() || undefined,
    };

    setLinks((prev) => [...prev, newLink]);
    setLinkTitle("");
    setLinkUrl("");
    setLinkDescription("");
    setShowLinkModal(false);
  };

  const handleRemoveLink = (linkId: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
  };

  return {
    isImageLoading,
    showLinkModal,
    setShowLinkModal,
    linkTitle,
    setLinkTitle,
    linkUrl,
    setLinkUrl,
    linkType,
    setLinkType,
    linkDescription,
    setLinkDescription,
    handleAddImage,
    handleAddFile,
    handleRemoveFile,
    handleRemoveImage,
    handleAddLink,
    handleRemoveLink,
  };
}
