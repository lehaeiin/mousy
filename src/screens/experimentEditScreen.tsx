import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ExperimentMethod } from "../types/project";
import type { RootStackParamList } from "../navigation/AppNavigator";
import GradientBackground from "../components/gradientBackground";
import TemplateButtonGroup from "../components/templateButtonGroup";
import TagInput from "../components/tagInput";
import ImageGallery from "../components/imageGallery";
import FileList from "../components/fileList";
import LinkList from "../components/linkList";
import LinkModal from "../components/linkModal";
import InVivoForm from "../components/experiment/invivoForm";
import InVitroForm from "../components/experiment/invitroForm";
import CharacterizationForm from "../components/experiment/characterizationForm";
import ScreenHeader from "../components/layout/ScreenHeader";
import SaveButton from "../components/layout/SaveButton";
import { EXPERIMENT_METHODS, EXPERIMENT_STAGES } from "../constants/experiment";
import { useExperimentForm } from "../hooks/useExperimentForm";
import { useMediaAttachments } from "../hooks/useMediaAttachments";
import { useExperimentSave } from "../hooks/useExperimentSave";
import {
  getExpandedSectionsForStage,
  INITIAL_EXPANDED_SECTIONS,
  type ExpandedSections,
} from "../utils/expandedSectionsHelpers";
import { styles } from "./experimentEdit/styles";

type ExperimentEditScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ExperimentEdit"
>;

export default function ExperimentEditScreen() {
  const navigation = useNavigation<ExperimentEditScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "ExperimentEdit">>();
  const { projectId, experimentId } = route.params;

  const form = useExperimentForm(experimentId);
  const {
    title,
    setTitle,
    notes,
    setNotes,
    tags,
    tagInput,
    setTagInput,
    stage,
    setStage,
    method,
    setMethod,
    otherMethod,
    setOtherMethod,
    status,
    setStatus,
    images,
    setImages,
    files,
    setFiles,
    links,
    setLinks,
    mouseVendor,
    setMouseVendor,
    strain,
    setStrain,
    ageWeeks,
    setAgeWeeks,
    diet,
    setDiet,
    runNumber,
    setRunNumber,
    inVivoMetadata,
    setInVivoMetadata,
    inVitroMetadata,
    setInVitroMetadata,
    characterizationMetadata,
    setCharacterizationMetadata,
    generateTitle,
    buildExperiment,
    addTag,
    removeTag,
  } = form;

  const media = useMediaAttachments({
    images,
    setImages,
    files,
    setFiles,
    links,
    setLinks,
    experimentId,
  });
  const {
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
  } = media;

  const { save, isLoading } = useExperimentSave({
    projectId,
    experimentId,
    buildExperiment,
  });

  const [expandedSections, setExpandedSections] = useState<ExpandedSections>(
    INITIAL_EXPANDED_SECTIONS
  );

  React.useEffect(() => {
    setExpandedSections(getExpandedSectionsForStage(stage));
  }, [stage]);

  type InVivoSection = keyof ExpandedSections["inVivo"];
  type InVitroSection = keyof ExpandedSections["inVitro"];
  type CharacterizationSection = keyof ExpandedSections["characterization"];
  /**
   * 제네릭 섹션 토글 함수
   * 모든 실험 단계의 섹션 토글에 재사용 가능
   */
  const createToggleSection = <
    T extends "inVivo" | "inVitro" | "characterization"
  >(
    stage: T
  ) => {
    return (section: keyof ExpandedSections[T]) => {
      setExpandedSections((prev) => ({
        ...prev,
        [stage]: {
          ...prev[stage],
          [section]: !prev[stage][section],
        },
      }));
    };
  };

  const toggleInVivo = createToggleSection("inVivo");
  const toggleInVitro = createToggleSection("inVitro");
  const toggleCharacterization = createToggleSection("characterization");

  const handleSave = async () => {
    if (!stage) {
      Alert.alert("알림", "실험 단계를 선택해주세요.");
      return;
    }
    await save();
  };

  const handleMethodSelect = (selectedMethod: ExperimentMethod) => {
    setMethod(selectedMethod);
    if (selectedMethod !== "Other") {
      setOtherMethod("");
    }
  };

  return (
    <GradientBackground>
      <ScreenHeader
        title={experimentId ? "실험 수정" : "실험 작성"}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>상태</Text>
            <TemplateButtonGroup
              options={[
                { key: "planning", label: "계획" },
                { key: "in-progress", label: "진행중" },
                { key: "completed", label: "완료" },
                { key: "failed", label: "실패" },
              ]}
              selectedValue={status}
              onSelect={setStatus}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>실험 단계 *</Text>
            <TemplateButtonGroup
              options={EXPERIMENT_STAGES.map((s) => ({
                key: s.key,
                label: s.label,
                icon: s.icon,
              }))}
              selectedValue={stage}
              onSelect={setStage}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>실험 방법 (선택사항)</Text>
            <TemplateButtonGroup
              options={EXPERIMENT_METHODS.map((m) => ({
                key: m.key,
                label: m.label,
              }))}
              selectedValue={method}
              onSelect={handleMethodSelect}
            />
            {method === "Other" && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.label}>기타 실험 방법 입력</Text>
                <TextInput
                  style={styles.titleInput}
                  value={otherMethod}
                  onChangeText={setOtherMethod}
                  placeholder="실험 방법을 입력하세요"
                  placeholderTextColor="#999"
                />
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.titleHeader}>
              <Text style={styles.label}>제목</Text>
              <TouchableOpacity
                style={styles.autoGenerateButton}
                onPress={() => setTitle(generateTitle())}
              >
                <Text style={styles.autoGenerateText}>자동 생성</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="제목이 자동 생성됩니다"
              placeholderTextColor="#999"
            />
          </View>

          {stage === "characterization" && (
            <View style={styles.section}>
              <CharacterizationForm
                expandedSections={expandedSections.characterization}
                toggleSection={toggleCharacterization}
                metadata={characterizationMetadata}
                setMetadata={setCharacterizationMetadata}
              />
            </View>
          )}

          {stage === "in-vitro" && (
            <View style={styles.section}>
              <InVitroForm
                expandedSections={expandedSections.inVitro}
                toggleSection={toggleInVitro}
                metadata={inVitroMetadata}
                setMetadata={setInVitroMetadata}
              />
            </View>
          )}

          {stage === "in-vivo" && (
            <View style={styles.section}>
              <InVivoForm
                expandedSections={expandedSections.inVivo}
                toggleSection={toggleInVivo}
                metadata={inVivoMetadata}
                setMetadata={setInVivoMetadata}
                legacy={{
                  strain,
                  setStrain,
                  ageWeeks,
                  setAgeWeeks,
                  mouseVendor,
                  setMouseVendor,
                  diet,
                  setDiet,
                  runNumber,
                  setRunNumber,
                }}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>노트</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="실험 내용을 기록하세요..."
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
            />
          </View>

          <TagInput
            tags={tags}
            tagInput={tagInput}
            onTagInputChange={setTagInput}
            onAddTag={addTag}
            onRemoveTag={removeTag}
          />

          <ImageGallery
            images={images}
            files={files}
            isImageLoading={isImageLoading}
            onAddImage={handleAddImage}
            onRemoveImage={handleRemoveImage}
          />

          <FileList
            files={files}
            images={images}
            onAddFile={handleAddFile}
            onRemoveFile={handleRemoveFile}
          />

          <LinkList
            links={links}
            onAddLink={() => setShowLinkModal(true)}
            onRemoveLink={handleRemoveLink}
          />

          <View style={styles.section}>
            <Text style={styles.label}>작성 시간</Text>
            <Text style={styles.timestamp}>
              {new Date().toLocaleString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </ScrollView>

        <SaveButton loading={isLoading} onPress={handleSave} />
      </KeyboardAvoidingView>

      <LinkModal
        visible={showLinkModal}
        linkTitle={linkTitle}
        linkUrl={linkUrl}
        linkType={linkType}
        linkDescription={linkDescription}
        onLinkTitleChange={setLinkTitle}
        onLinkUrlChange={setLinkUrl}
        onLinkTypeChange={setLinkType}
        onLinkDescriptionChange={setLinkDescription}
        onAdd={handleAddLink}
        onCancel={() => {
          setShowLinkModal(false);
          setLinkTitle("");
          setLinkUrl("");
          setLinkDescription("");
        }}
      />
    </GradientBackground>
  );
}
