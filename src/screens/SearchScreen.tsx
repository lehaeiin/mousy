import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  advancedSearchExperiments,
  searchProjects,
  searchExperimentsByTags,
  searchExperimentsByStage,
  searchExperimentsByProjectName,
  type SearchOptions,
} from "../services/supabaseStorage";
import { Experiment } from "../types/experiment";
import { Project } from "../types/project";
import { ExperimentStage } from "../types/project";
import type { RootStackParamList } from "../navigation/AppNavigator";
import GradientBackground from "../components/gradientBackground";
import { commonStyles } from "../styles/common";
import { colors, spacing, typography, borderRadius, shadows } from "../styles/theme";

type SearchScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Search"
>;

const STAGES: { key: ExperimentStage; label: string; icon: string }[] = [
  { key: "characterization", label: "characterization", icon: "🔬" },
  { key: "in-vitro", label: "in vitro", icon: "🧪" },
  { key: "in-vivo", label: "in vivo", icon: "🐭" },
];

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<ExperimentStage | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [projectNameFilter, setProjectNameFilter] = useState("");
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<"experiments" | "projects">("experiments");

  // 검색 실행
  const performSearch = useCallback(async () => {
    if (!searchQuery.trim() && !selectedStage && selectedTags.length === 0 && !projectNameFilter.trim()) {
      setExperiments([]);
      setProjects([]);
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      if (searchMode === "experiments") {
        // 실험 검색
        const options: SearchOptions = {
          query: searchQuery.trim() || undefined,
          projectName: projectNameFilter.trim() || undefined,
          stage: selectedStage || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          limit: 100,
        };

        const results = await advancedSearchExperiments(options);
        setExperiments(results);
      } else {
        // 프로젝트 검색
        const results = await searchProjects(searchQuery.trim() || "");
        setProjects(results);
      }
    } catch (error) {
      console.error("검색 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStage, selectedTags, projectNameFilter, searchMode]);

  // 검색어 변경 시 자동 검색 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [performSearch]);

  // 태그 추가
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setTagInput("");
    }
  };

  // 태그 제거
  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  // 실험 항목 렌더링
  const renderExperimentItem = ({ item }: { item: Experiment }) => {
    const stageInfo = STAGES.find((s) => s.key === item.stage);
    
    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() =>
          navigation.navigate("ExperimentDetail", { experimentId: item.id })
        }
      >
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {stageInfo && (
            <View style={styles.stageBadge}>
              <Text style={styles.stageIcon}>{stageInfo.icon}</Text>
              <Text style={styles.stageText}>{stageInfo.label}</Text>
            </View>
          )}
        </View>
        {item.notes && (
          <Text style={styles.resultNotes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
            )}
          </View>
        )}
        <Text style={styles.resultDate}>
          {new Date(item.date).toLocaleDateString("ko-KR")}
        </Text>
      </TouchableOpacity>
    );
  };

  // 프로젝트 항목 렌더링
  const renderProjectItem = ({ item }: { item: Project }) => {
    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() =>
          navigation.navigate("ProjectDetail", {
            projectId: item.id,
            projectName: item.name,
          })
        }
      >
        <Text style={styles.resultTitle}>{item.name}</Text>
        {item.description && (
          <Text style={styles.resultNotes} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text style={styles.resultDate}>
          생성일: {new Date(item.createdAt).toLocaleDateString("ko-KR")}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <GradientBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* 검색 모드 선택 */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              searchMode === "experiments" && styles.modeButtonActive,
            ]}
            onPress={() => {
              setSearchMode("experiments");
              setProjects([]);
            }}
          >
            <Text
              style={[
                styles.modeButtonText,
                searchMode === "experiments" && styles.modeButtonTextActive,
              ]}
            >
              실험 검색
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              searchMode === "projects" && styles.modeButtonActive,
            ]}
            onPress={() => {
              setSearchMode("projects");
              setExperiments([]);
              setSelectedStage(null);
              setSelectedTags([]);
              setProjectNameFilter("");
            }}
          >
            <Text
              style={[
                styles.modeButtonText,
                searchMode === "projects" && styles.modeButtonTextActive,
              ]}
            >
              프로젝트 검색
            </Text>
          </TouchableOpacity>
        </View>

        {/* 검색 입력 */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="검색어를 입력하세요..."
            placeholderTextColor={colors.text.white70}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* 실험 검색 필터 */}
        {searchMode === "experiments" && (
          <>
            {/* 프로젝트명 필터 */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>프로젝트명</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="프로젝트명으로 필터링..."
                placeholderTextColor={colors.text.white70}
                value={projectNameFilter}
                onChangeText={setProjectNameFilter}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* 단계 필터 */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>실험 단계</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.stageContainer}
              >
                {STAGES.map((stage) => (
                  <TouchableOpacity
                    key={stage.key}
                    style={[
                      styles.stageButton,
                      selectedStage === stage.key && styles.stageButtonActive,
                    ]}
                    onPress={() =>
                      setSelectedStage(
                        selectedStage === stage.key ? null : stage.key
                      )
                    }
                  >
                    <Text style={styles.stageButtonIcon}>{stage.icon}</Text>
                    <Text
                      style={[
                        styles.stageButtonText,
                        selectedStage === stage.key &&
                          styles.stageButtonTextActive,
                      ]}
                    >
                      {stage.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 태그 필터 */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>태그</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="태그 추가..."
                  placeholderTextColor={colors.text.white70}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.addTagButton}
                  onPress={addTag}
                >
                  <Text style={styles.addTagButtonText}>추가</Text>
                </TouchableOpacity>
              </View>
              {selectedTags.length > 0 && (
                <View style={styles.selectedTagsContainer}>
                  {selectedTags.map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.selectedTag}
                      onPress={() => removeTag(tag)}
                    >
                      <Text style={styles.selectedTagText}>#{tag}</Text>
                      <Text style={styles.removeTagIcon}>×</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* 검색 결과 */}
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {searchMode === "experiments" ? "실험" : "프로젝트"} 검색 결과
            </Text>
            {loading && <ActivityIndicator size="small" color={colors.primary} />}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : searchMode === "experiments" ? (
            experiments.length > 0 ? (
              <FlatList
                data={experiments}
                renderItem={renderExperimentItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
                  </View>
                }
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  검색어를 입력하거나 필터를 선택하세요
                </Text>
              </View>
            )
          ) : (
            projects.length > 0 ? (
              <FlatList
                data={projects}
                renderItem={renderProjectItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  검색어를 입력하세요
                </Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingTop: 80,
  },
  modeSelector: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    backgroundColor: colors.background.white25,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: borderRadius.md,
  },
  modeButtonActive: {
    backgroundColor: colors.background.white90,
  },
  modeButtonText: {
    fontSize: typography.sizes.base,
    color: colors.text.white70,
    fontWeight: typography.weights.medium,
  },
  modeButtonTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  searchSection: {
    marginBottom: spacing.lg,
  },
  searchInput: {
    backgroundColor: colors.background.white90,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    ...shadows.md,
  },
  filterSection: {
    marginBottom: spacing.lg,
  },
  filterLabel: {
    ...commonStyles.label,
    marginBottom: spacing.sm,
  },
  filterInput: {
    backgroundColor: colors.background.white90,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    ...shadows.sm,
  },
  stageContainer: {
    flexDirection: "row",
  },
  stageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.white25,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  stageButtonActive: {
    backgroundColor: colors.background.white90,
    borderColor: colors.primary,
  },
  stageButtonIcon: {
    fontSize: typography.sizes.base,
    marginRight: spacing.xs,
  },
  stageButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text.white90,
    fontWeight: typography.weights.medium,
  },
  stageButtonTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  tagInputContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagInput: {
    flex: 1,
    backgroundColor: colors.background.white90,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    ...shadows.sm,
  },
  addTagButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: "center",
    ...shadows.sm,
  },
  addTagButtonText: {
    color: colors.text.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  selectedTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
  },
  selectedTagText: {
    fontSize: typography.sizes.sm,
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
  },
  removeTagIcon: {
    fontSize: typography.sizes.lg,
    color: colors.text.white,
    fontWeight: typography.weights.bold,
  },
  resultsSection: {
    marginTop: spacing.md,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  resultsTitle: {
    ...commonStyles.sectionTitle,
    marginBottom: 0,
  },
  loadingContainer: {
    padding: spacing.xxxl,
    alignItems: "center",
  },
  resultCard: {
    ...commonStyles.card,
    marginBottom: spacing.md,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  resultTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1,
  },
  stageBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.white25,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  stageIcon: {
    fontSize: typography.sizes.sm,
    marginRight: spacing.xs,
  },
  stageText: {
    fontSize: typography.sizes.sm,
    color: colors.text.white90,
    fontWeight: typography.weights.medium,
  },
  resultNotes: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  tag: {
    ...commonStyles.tag,
  },
  tagText: {
    ...commonStyles.tagText,
  },
  moreTagsText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  resultDate: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  emptyContainer: {
    padding: spacing.xxxl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.text.white70,
    textAlign: "center",
  },
});

