import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
  PanResponder,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import {
  getProject,
  getExperimentsByProject,
  getExperimentsByProjectAndStage,
  deleteExperiment,
} from "../services/supabaseStorage";
import { subscribeToProjectExperiments } from "../services/realtimeService";
import { isExperimentSynced, startAutoSync, stopAutoSync } from "../services/syncService";
import SyncStatusBadge from "../components/syncStatusBadge";
import { Project, ExperimentStage } from "../types/project";
import { Experiment } from "../types/experiment";
import type { RootStackParamList } from "../navigation/AppNavigator";
import GradientBackground from "../components/gradientBackground";
import { commonStyles } from "../styles/common";
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../styles/theme";

type ProjectDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProjectDetail"
>;

type RouteParams = {
  projectId: string;
  projectName?: string;
};

const STAGES: { key: ExperimentStage; label: string; icon: string }[] = [
  { key: "characterization", label: "characterization", icon: "🔬" },
  { key: "in-vitro", label: "in vitro", icon: "🧪" },
  { key: "in-vivo", label: "in vivo", icon: "🐭" },
];

export default function ProjectDetailScreen() {
  const navigation = useNavigation<ProjectDetailScreenNavigationProp>();
  const route = useRoute();
  const params = route.params as RouteParams;
  const { projectId, projectName } = params;
  const insets = useSafeAreaInsets();

  const [project, setProject] = useState<Project | null>(null);
  const [selectedStage, setSelectedStage] = useState<ExperimentStage | null>(
    null
  );
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [allExperiments, setAllExperiments] = useState<Experiment[]>([]); // 전체 실험 (차수 결정용)
  const [syncStatuses, setSyncStatuses] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    loadAllExperiments(); // 전체 실험 먼저 로드 (차수 결정)
  }, [projectId]);

  useEffect(() => {
    filterExperimentsByStage(); // 단계별 필터 적용
  }, [projectId, selectedStage, allExperiments]);

  // 화면이 포커스될 때마다 실험 목록 새로고침
  useFocusEffect(
    useCallback(() => {
      loadProject();
      loadAllExperiments().then(() => {
        // 실험 로드 후 동기화 상태 확인
        checkSyncStatuses();
      });
    }, [projectId, projectName])
  );

  // Realtime 구독 설정
  useEffect(() => {
    // 자동 동기화 시작
    startAutoSync();

    // Realtime 구독
    const unsubscribe = subscribeToProjectExperiments(
      projectId,
      (newExperiment) => {
        // 새 실험 추가
        setAllExperiments((prev) => {
          const exists = prev.find((exp) => exp.id === newExperiment.id);
          if (exists) return prev;
          return [newExperiment, ...prev];
        });
        // 동기화 상태 확인
        checkSyncStatus(newExperiment.id);
      },
      (updatedExperiment) => {
        // 실험 업데이트
        setAllExperiments((prev) =>
          prev.map((exp) =>
            exp.id === updatedExperiment.id ? updatedExperiment : exp
          )
        );
        // 동기화 상태 확인
        checkSyncStatus(updatedExperiment.id);
      },
      (deletedId) => {
        // 실험 삭제
        setAllExperiments((prev) => prev.filter((exp) => exp.id !== deletedId));
        setSyncStatuses((prev) => {
          const newMap = new Map(prev);
          newMap.delete(deletedId);
          return newMap;
        });
      }
    );

    return () => {
      unsubscribe();
      stopAutoSync();
    };
  }, [projectId]);

  // 동기화 상태 확인
  const checkSyncStatus = async (experimentId: string) => {
    const synced = await isExperimentSynced(experimentId);
    setSyncStatuses((prev) => {
      const newMap = new Map(prev);
      newMap.set(experimentId, synced);
      return newMap;
    });
  };

  // 모든 실험의 동기화 상태 확인
  const checkSyncStatuses = useCallback(async () => {
    if (allExperiments.length === 0) return;
    const statuses = new Map<string, boolean>();
    for (const exp of allExperiments) {
      const synced = await isExperimentSynced(exp.id);
      statuses.set(exp.id, synced);
    }
    setSyncStatuses(statuses);
  }, [allExperiments]);

  const loadProject = async () => {
    try {
      const data = await getProject(projectId);
      setProject(data);
    } catch (error) {
      console.error("프로젝트 로드 실패:", error);
    }
  };

  // 전체 실험 로드 (차수 결정용)
  const loadAllExperiments = async () => {
    try {
      let data: Experiment[] = [];

      // 프로젝트명이 있으면 같은 이름의 모든 프로젝트의 실험 가져오기
      if (projectName) {
        const { getProjects, getExperiments } = await import(
          "../services/supabaseStorage"
        );
        const allProjects = await getProjects();
        const sameNameProjectIds = allProjects
          .filter((p) => p.name === projectName)
          .map((p) => p.id);
        const allExperimentsData = await getExperiments();
        data = allExperimentsData.filter((exp) =>
          sameNameProjectIds.includes(exp.projectId)
        );
      } else {
        // 프로젝트명이 없으면 기존 방식
        data = await getExperimentsByProject(projectId);
      }

      // 단계별로 그룹화하여 각 단계 내에서 날짜순 정렬 및 n차 부여
      const stageGroups: { [key in ExperimentStage]?: Experiment[] } = {};

      // 단계별로 그룹화
      data.forEach((exp) => {
        if (!stageGroups[exp.stage]) {
          stageGroups[exp.stage] = [];
        }
        stageGroups[exp.stage]!.push(exp);
      });

      // 각 단계별로 날짜순 정렬 후 n차 부여
      const experimentsWithRunNumber: Experiment[] = [];
      Object.keys(stageGroups).forEach((stage) => {
        const stageExps = stageGroups[stage as ExperimentStage]!;
        // 날짜순 정렬 (오래된 순)
        const sorted = stageExps.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        // 각 단계 내에서 n차 부여
        sorted.forEach((exp, index) => {
          experimentsWithRunNumber.push({
            ...exp,
            runNumber: index + 1, // 단계별 차수
          });
        });
      });

      // 최신순으로 정렬 (날짜 기준)
      const finalSorted = experimentsWithRunNumber.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setAllExperiments(finalSorted);
      
      // 동기화 상태 확인
      const statuses = new Map<string, boolean>();
      for (const exp of finalSorted) {
        const synced = await isExperimentSynced(exp.id);
        statuses.set(exp.id, synced);
      }
      setSyncStatuses(statuses);
    } catch (error) {
      console.error("실험 목록 로드 실패:", error);
    }
  };

  // 단계별 필터 적용 (전체 기준 차수 유지)
  const filterExperimentsByStage = () => {
    if (allExperiments.length === 0) {
      // 아직 전체 실험을 로드하지 않았으면 빈 배열
      setExperiments([]);
      return;
    }

    if (!selectedStage) {
      // 전체 보기
      setExperiments(allExperiments);
    } else {
      // 단계별 필터 적용 (차수는 전체 기준으로 유지)
      // allExperiments에서 필터링하되, runNumber는 그대로 유지
      const filtered = allExperiments
        .filter((exp) => exp.stage === selectedStage)
        .map((exp) => ({
          ...exp,
          // runNumber는 전체 기준으로 유지
        }));
      setExperiments(filtered);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteExperiment = (experimentId: string) => {
    Alert.alert("삭제 확인", "이 실험을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteExperiment(experimentId);
            loadAllExperiments(); // 전체 목록 새로고침
          } catch (error) {
            console.error("삭제 실패:", error);
            Alert.alert("오류", "삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: Experiment["status"]) => {
    return colors.status[status] || colors.text.tertiary;
  };

  const getStatusText = (status: Experiment["status"]) => {
    switch (status) {
      case "completed":
        return "완료";
      case "in-progress":
        return "진행중";
      case "failed":
        return "실패";
      case "planning":
        return "계획";
      default:
        return "";
    }
  };

  if (!project) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </GradientBackground>
    );
  }

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
        <Text style={styles.topHeaderTitle}>프로젝트 상세</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>
      {/* 프로젝트 헤더 */}
      <View style={styles.header}>
        <Text style={styles.projectName}>{projectName || project.name}</Text>
        {project.description && (
          <Text style={styles.projectDescription}>{project.description}</Text>
        )}
        <Text style={styles.experimentCountText}>
          {experiments.length}개 실험
        </Text>
      </View>

      {/* 단계 필터 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.stageFilter}
        contentContainerStyle={styles.stageFilterContent}
      >
        <TouchableOpacity
          style={[
            styles.stageButton,
            selectedStage === null && styles.stageButtonActive,
          ]}
          onPress={() => setSelectedStage(null)}
        >
          <Text
            style={[
              styles.stageButtonText,
              selectedStage === null && styles.stageButtonTextActive,
            ]}
          >
            전체
          </Text>
        </TouchableOpacity>
        {STAGES.map((stage) => (
          <TouchableOpacity
            key={stage.key}
            style={[
              styles.stageButton,
              selectedStage === stage.key && styles.stageButtonActive,
            ]}
            onPress={() => setSelectedStage(stage.key)}
          >
            <Text
              style={[
                styles.stageButtonText,
                selectedStage === stage.key && styles.stageButtonTextActive,
              ]}
            >
              {stage.icon} {stage.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 실험 목록 */}
      <FlatList
        data={experiments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ExperimentCard
            experiment={item}
            navigation={navigation}
            onDelete={handleDeleteExperiment}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            formatDate={formatDate}
            isSynced={syncStatuses.get(item.id) ?? true}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>실험이 없습니다</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate("ExperimentEdit", {
            projectId: projectId,
            experimentId: undefined,
          })
        }
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </GradientBackground>
  );
}

// 실험 카드 컴포넌트
function ExperimentCard({
  experiment,
  navigation,
  onDelete,
  getStatusColor,
  getStatusText,
  formatDate,
  isSynced,
}: {
  experiment: Experiment;
  navigation: ProjectDetailScreenNavigationProp;
  onDelete: (id: string) => void;
  getStatusColor: (status: Experiment["status"]) => string;
  getStatusText: (status: Experiment["status"]) => string;
  formatDate: (date: Date) => string;
  isSynced: boolean;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [showDelete, setShowDelete] = useState(false);
  const [cardHeight, setCardHeight] = useState<number | null>(null);
  const currentTranslateX = useRef(0); // 현재 translateX 값을 추적
  const SWIPE_THRESHOLD = 50;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 수평 스와이프 감지 (수직보다 수평이 더 크고, 최소 10px 이상)
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        // 터치 시작 시 현재 translateX 값을 추적
        translateX.stopAnimation((value) => {
          currentTranslateX.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        // 현재 위치에서 dx만큼 이동
        const newValue = currentTranslateX.current + gestureState.dx;
        
        if (showDelete) {
          // 삭제 버튼이 보이는 상태: 오른쪽으로 스와이프하면 닫기
          translateX.setValue(Math.max(Math.min(newValue, 0), -80));
        } else {
          // 삭제 버튼이 안 보이는 상태: 왼쪽으로 스와이프만 허용
          if (gestureState.dx < 0) {
            // 왼쪽으로 스와이프 중이면 삭제 버튼 표시
            if (!showDelete) {
              setShowDelete(true);
            }
            translateX.setValue(Math.max(Math.min(newValue, 0), -80));
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const finalValue = currentTranslateX.current + gestureState.dx;
        
        if (showDelete) {
          // 이미 삭제 버튼이 보이는 상태
          if (gestureState.dx > 20 || finalValue > -40) {
            // 오른쪽으로 스와이프하면 닫기
            currentTranslateX.current = 0;
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start(() => {
              currentTranslateX.current = 0;
            });
            setShowDelete(false);
          } else {
            // 원래 위치 유지
            currentTranslateX.current = -80;
            Animated.spring(translateX, {
              toValue: -80,
              useNativeDriver: true,
            }).start(() => {
              currentTranslateX.current = -80;
            });
          }
        } else {
          // 삭제 버튼이 안 보이는 상태
          if (gestureState.dx < -SWIPE_THRESHOLD || finalValue < -40) {
            // 왼쪽으로 충분히 스와이프했으면 삭제 버튼 표시
            currentTranslateX.current = -80;
            Animated.spring(translateX, {
              toValue: -80,
              useNativeDriver: true,
            }).start(() => {
              currentTranslateX.current = -80;
            });
            setShowDelete(true);
          } else {
            // 원래 위치로 복귀
            currentTranslateX.current = 0;
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start(() => {
              currentTranslateX.current = 0;
            });
          }
        }
      },
    })
  ).current;

  const handleCardWrapperLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      setCardHeight(height);
    }
  };

  const handleLongPress = () => {
    currentTranslateX.current = -80;
    Animated.spring(translateX, {
      toValue: -80,
      useNativeDriver: true,
    }).start(() => {
      currentTranslateX.current = -80;
    });
    setShowDelete(true);
  };

  const handleDelete = () => {
    onDelete(experiment.id);
    currentTranslateX.current = 0;
    translateX.setValue(0);
    setShowDelete(false);
  };

  const handleCardPress = () => {
    if (showDelete) {
      currentTranslateX.current = 0;
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start(() => {
        currentTranslateX.current = 0;
      });
      setShowDelete(false);
    } else {
      navigation.navigate("ExperimentDetail", {
        experimentId: experiment.id,
      });
    }
  };

  return (
    <View style={experimentCardStyles.cardContainer}>
      {/* 삭제 버튼 (카드 뒤에 배치, showDelete가 true일 때만 표시) */}
      {showDelete && cardHeight !== null && (
        <View style={[experimentCardStyles.deleteButtonContainer, { height: cardHeight }]}>
          <TouchableOpacity
            style={[experimentCardStyles.deleteButton, { height: cardHeight }]}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Text style={experimentCardStyles.deleteButtonText}>삭제</Text>
          </TouchableOpacity>
        </View>
      )}
      <Animated.View
        style={[
          experimentCardStyles.cardWrapper,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <BlurView
          intensity={20}
          style={experimentCardStyles.experimentCardBlur}
          onLayout={handleCardWrapperLayout}
        >
          <TouchableOpacity
            style={experimentCardStyles.experimentCard}
            onPress={handleCardPress}
            onLongPress={handleLongPress}
            activeOpacity={0.7}
          >
            <View style={experimentCardStyles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text
                  style={experimentCardStyles.experimentTitle}
                  numberOfLines={1}
                >
                  {experiment.runNumber
                    ? `${experiment.runNumber}차`
                    : "제목 없음"}
                </Text>
                {experiment.title &&
                  experiment.title !== `${experiment.runNumber}차` && (
                    <Text
                      style={experimentCardStyles.experimentSubtitle}
                      numberOfLines={1}
                    >
                      {experiment.title}
                    </Text>
                  )}
              </View>
              <View
                style={[
                  experimentCardStyles.statusBadge,
                  { backgroundColor: getStatusColor(experiment.status) },
                ]}
              >
                <Text style={experimentCardStyles.statusBadgeText}>
                  {getStatusText(experiment.status)}
                </Text>
              </View>
            </View>

            {experiment.method && (
              <View style={experimentCardStyles.methodBadge}>
                <Text style={experimentCardStyles.methodBadgeText}>
                  {experiment.method}
                </Text>
              </View>
            )}

            {experiment.notes && (
              <Text
                style={experimentCardStyles.experimentNotes}
                numberOfLines={2}
              >
                {experiment.notes}
              </Text>
            )}

            <View style={experimentCardStyles.footer}>
              <Text style={experimentCardStyles.experimentDate}>
                {formatDate(experiment.date)}
              </Text>
              <SyncStatusBadge synced={isSynced} />
            </View>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const experimentCardStyles = StyleSheet.create({
  cardContainer: {
    marginBottom: spacing.lg,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  cardWrapper: {
    position: "relative",
    zIndex: 1,
    width: "100%",
  },
  deleteButtonContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
    backgroundColor: "transparent",
  },
  deleteButton: {
    width: "100%",
    backgroundColor: colors.error,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.xxl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 0,
    overflow: "hidden",
  },
  deleteButtonText: {
    color: colors.text.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  experimentCardBlur: {
    ...commonStyles.glassContainer,
    marginBottom: spacing.lg,
  },
  experimentCard: {
    ...commonStyles.glassCard,
    marginBottom: 0,
    padding: spacing.xxl,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  experimentTitle: {
    fontSize: typography.sizes["2xl"],
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    marginRight: spacing.md,
    letterSpacing: -0.3,
  },
  experimentSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.white90,
    marginTop: spacing.xs,
    marginRight: spacing.md,
  },
  statusBadge: {
    ...commonStyles.badge,
  },
  statusBadgeText: {
    ...commonStyles.badgeText,
  },
  methodBadge: {
    ...commonStyles.tag,
    alignSelf: "flex-start",
    marginBottom: spacing.md,
  },
  methodBadgeText: {
    ...commonStyles.tagText,
  },
  experimentNotes: {
    fontSize: typography.sizes.base,
    color: colors.text.white90,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  experimentDate: {
    fontSize: typography.sizes.sm,
    color: colors.text.white70,
    fontWeight: typography.weights.medium,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
});

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    backgroundColor: "transparent",
  },
  projectName: {
    ...commonStyles.cardTitle,
    marginBottom: spacing.sm,
  },
  projectDescription: {
    ...commonStyles.subtitleWhite,
  },
  experimentCountText: {
    fontSize: typography.sizes.base,
    color: colors.text.white90,
    marginTop: spacing.sm,
    fontWeight: typography.weights.medium,
  },
  stageFilter: {
    paddingVertical: spacing.sm,
  },
  stageFilterContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  stageButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.background.white25,
    marginRight: spacing.sm + 2,
    borderWidth: 1,
    borderColor: "rgba(240, 240, 243, 0.3)",
  },
  stageButtonActive: {
    backgroundColor: colors.background.white90,
    borderColor: "rgba(240, 240, 243, 0.5)",
  },
  stageButtonText: {
    fontSize: typography.sizes.base,
    color: colors.text.white90,
    fontWeight: typography.weights.semibold,
  },
  stageButtonTextActive: {
    color: colors.primary,
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  experimentCardBlur: {
    ...commonStyles.glassContainer,
    marginBottom: spacing.lg,
    flex: 1,
  },
  experimentCard: {
    ...commonStyles.glassCard,
    flex: 1,
    marginBottom: 0,
    padding: spacing.xxl,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  experimentTitle: {
    fontSize: typography.sizes["2xl"],
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    marginRight: spacing.md,
    letterSpacing: -0.3,
  },
  experimentSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.white90,
    marginTop: spacing.xs,
    marginRight: spacing.md,
  },
  statusBadge: {
    ...commonStyles.badge,
  },
  statusBadgeText: {
    ...commonStyles.badgeText,
  },
  methodBadge: {
    ...commonStyles.tag,
    alignSelf: "flex-start",
    marginBottom: spacing.md,
  },
  methodBadgeText: {
    ...commonStyles.tagText,
  },
  experimentNotes: {
    fontSize: typography.sizes.base,
    color: colors.text.white90,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  experimentDate: {
    fontSize: typography.sizes.sm,
    color: colors.text.white70,
    fontWeight: typography.weights.medium,
  },
  cardContainer: {
    marginBottom: spacing.lg,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  cardWrapper: {
    position: "relative",
    zIndex: 1,
    width: "100%",
  },
  deleteButtonContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 80,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
    backgroundColor: "transparent",
  },
  deleteButton: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.error,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.xxl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 0,
    overflow: "hidden",
  },
  deleteButtonText: {
    color: colors.text.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  emptyContainer: {
    ...commonStyles.emptyContainer,
    paddingTop: 50,
  },
  emptyText: {
    ...commonStyles.emptyText,
    fontSize: typography.sizes.xl,
  },
  loadingContainer: {
    ...commonStyles.loadingContainer,
  },
  loadingText: {
    ...commonStyles.loadingText,
  },
  topHeader: {
    ...commonStyles.topHeader,
  },
  backButton: {
    ...commonStyles.backButton,
  },
  backButtonText: {
    ...commonStyles.backButtonText,
  },
  backButtonPlaceholder: {
    ...commonStyles.backButtonPlaceholder,
  },
  topHeaderTitle: {
    ...commonStyles.topHeaderTitle,
  },
  fab: {
    ...commonStyles.fab,
  },
  fabText: {
    ...commonStyles.fabText,
  },
});
