import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { saveProject, getProject } from "../services/supabaseStorage";
import { Project } from "../types/project";
import type { RootStackParamList } from "../navigation/AppNavigator";
import GradientBackground from "../components/gradientBackground";
import { commonStyles } from "../styles/common";
import { colors, spacing, borderRadius, typography } from "../styles/theme";

type ProjectEditScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProjectEdit"
>;

type RouteParams = {
  projectId?: string;
};

export default function ProjectEditScreen() {
  const navigation = useNavigation<ProjectEditScreenNavigationProp>();
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const projectId = params?.projectId;
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;
    try {
      const project = await getProject(projectId);
      if (project) {
        setName(project.name);
        setDescription(project.description || "");
      }
    } catch (error) {
      console.error("프로젝트 로드 실패:", error);
      Alert.alert("오류", "프로젝트를 불러올 수 없습니다.");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("알림", "프로젝트 이름을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const project: Project = {
        id: projectId || Date.now().toString(),
        name: name.trim(),
        description: description.trim() || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await saveProject(project);
      Alert.alert("저장 완료", "프로젝트가 저장되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            if (projectId) {
              navigation.goBack();
            } else {
              navigation.replace("ProjectDetail", { projectId: project.id });
            }
          },
        },
      ]);
    } catch (error) {
      console.error("저장 실패:", error);
      Alert.alert("오류", "저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground>
      {/* 상단 헤더 */}
      <View style={[styles.topHeader, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>
          {projectId ? "프로젝트 편집" : "프로젝트 생성"}
        </Text>
        <View style={styles.backButtonPlaceholder} />
      </View>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          <View style={styles.section}>
            <Text style={styles.label}>프로젝트 이름 *</Text>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="예: siRNA 엑소좀, LMP, 설파살라진"
              placeholderTextColor={colors.text.white70}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>설명 (선택사항)</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="프로젝트에 대한 간단한 설명"
              placeholderTextColor={colors.text.white70}
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? "저장 중..." : "저장"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    ...commonStyles.topHeader,
  },
  topHeaderTitle: {
    ...commonStyles.topHeaderTitle,
    fontSize: typography.sizes["2xl"], // 프로젝트 편집은 조금 더 큰 제목
  },
  backButton: {
    ...commonStyles.backButton,
    padding: spacing.sm, // 프로젝트 편집은 padding 사용
  },
  backButtonText: {
    ...commonStyles.backButtonText,
    fontSize: typography.sizes["3xl"], // 프로젝트 편집은 조금 더 큰 버튼
  },
  backButtonPlaceholder: {
    ...commonStyles.backButtonPlaceholder,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    ...commonStyles.scrollContentWithHeader,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  label: {
    ...commonStyles.label,
  },
  nameInput: {
    ...commonStyles.input,
  },
  descriptionInput: {
    ...commonStyles.input,
    minHeight: 100,
  },
  footer: {
    ...commonStyles.footer,
  },
  saveButton: {
    ...commonStyles.buttonNeumorphic,
    backgroundColor: "rgba(139, 69, 19, 0.6)",
  },
  saveButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  saveButtonText: {
    ...commonStyles.buttonText,
  },
});
