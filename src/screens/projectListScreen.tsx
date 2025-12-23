import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Alert,
  PanResponder,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Keyboard,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import {
  getProjects,
  deleteProject,
  getExperimentsByProject,
  getExperiments,
  advancedSearchExperiments,
  searchProjects,
  type SearchOptions,
} from "../services/supabaseStorage";
import { Project } from "../types/project";
import { Experiment } from "../types/experiment";
import type { RootStackParamList } from "../navigation/AppNavigator";
import GradientBackground from "../components/gradientBackground";
import { colors, spacing } from "../styles/theme";
import { useAuth } from "../contexts/AuthContext";
import { projectCardStyles } from "../components/projectCard/ProjectCard.styles";
import { styles } from "./projectListScreen.styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 80;

type ProjectListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProjectList"
>;

const STAGES: { key: string; label: string; icon: string }[] = [
  { key: "characterization", label: "characterization", icon: "🔬" },
  { key: "in-vitro", label: "in vitro", icon: "🧪" },
  { key: "in-vivo", label: "in vivo", icon: "🐭" },
];

// 통합 리스트 데이터 타입 정의
type ListItem =
  | { type: "header"; data: { title: string } }
  | { type: "project"; data: Project }
  | { type: "experiment"; data: Experiment };

export default function ProjectListScreen() {
  const navigation = useNavigation<ProjectListScreenNavigationProp>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [allExperiments, setAllExperiments] = useState<Experiment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      // 프로젝트명으로 그룹화하여 중복 제거
      const projectNameMap = new Map<string, Project>();
      data.forEach((project) => {
        // 같은 이름의 프로젝트가 없거나, 더 최신 프로젝트면 업데이트
        if (
          !projectNameMap.has(project.name) ||
          new Date(project.updatedAt).getTime() >
            new Date(projectNameMap.get(project.name)!.updatedAt).getTime()
        ) {
          projectNameMap.set(project.name, project);
        }
      });
      // 최신순 정렬
      const uniqueProjects = Array.from(projectNameMap.values()).sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setProjects(uniqueProjects);
    } catch (error) {
      console.error("프로젝트 목록 로드 실패:", error);
    }
  };

  const loadExperiments = async () => {
    try {
      const data = await getExperiments();
      setAllExperiments(data);
      setExperiments(data);
    } catch (error) {
      console.error("실험 목록 로드 실패:", error);
    }
  };

  // 검색 실행
  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      await loadProjects();
      await loadExperiments();
      return;
    }

    setIsSearching(true);
    setLoading(true);
    Keyboard.dismiss();

    try {
      // 실험 검색
      const searchOptions: SearchOptions = {
        query: searchQuery.trim(),
        limit: 100,
      };
      const searchResults = await advancedSearchExperiments(searchOptions);
      setExperiments(searchResults);

      // 프로젝트 검색
      const projectResults = await searchProjects(searchQuery.trim());
      setProjects(projectResults);
    } catch (error) {
      console.error("검색 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // 검색어 변경 시 자동 검색 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [performSearch]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadProjects(), loadExperiments()]);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    await loadExperiments();
    setRefreshing(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    Alert.alert(
      "프로젝트 삭제",
      "정말로 이 프로젝트를 삭제하시겠습니까? 이 프로젝트에 속한 모든 실험도 삭제됩니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProject(projectId);
              loadProjects();
            } catch (error) {
              console.error("프로젝트 삭제 실패:", error);
              Alert.alert("오류", "프로젝트 삭제에 실패했습니다.");
            }
          },
        },
      ]
    );
  };

  // 프로젝트별 실험 개수 계산
  const experimentCountMap = React.useMemo(() => {
    const map = new Map<string, number>();

    // 같은 이름의 프로젝트들을 그룹화하여 계산
    projects.forEach((project) => {
      const sameNameProjects = projects.filter((p) => p.name === project.name);
      const sameNameProjectIds = sameNameProjects.map((p) => p.id);
      const count = allExperiments.filter((exp) =>
        sameNameProjectIds.includes(exp.projectId)
      ).length;
      map.set(project.id, count);
    });

    return map;
  }, [projects, allExperiments]);

  const renderProjectItem = React.useCallback(
    ({ item }: { item: Project }) => (
      <ProjectCard
        project={item}
        navigation={navigation}
        onDelete={handleDeleteProject}
        experimentCount={experimentCountMap.get(item.id) ?? 0}
      />
    ),
    [navigation, handleDeleteProject, experimentCountMap]
  );

  const renderExperimentItem = React.useCallback(
    ({ item }: { item: Experiment }) => {
      const stageInfo = STAGES.find((s) => s.key === item.stage);

      return (
        <BlurView intensity={20} style={styles.experimentCardBlur}>
          <TouchableOpacity
            style={styles.experimentCard}
            onPress={() =>
              navigation.navigate("ExperimentDetail", { experimentId: item.id })
            }
          >
            <View style={styles.experimentHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.experimentTitle} numberOfLines={1}>
                  {item.title || "제목 없음"}
                </Text>
                {item.runNumber && (
                  <Text style={styles.experimentRunNumber}>
                    {item.runNumber}차
                  </Text>
                )}
              </View>
              {stageInfo && (
                <View style={styles.stageBadge}>
                  <Text style={styles.stageIcon}>{stageInfo.icon}</Text>
                  <Text style={styles.stageText}>{stageInfo.label}</Text>
                </View>
              )}
            </View>
            {item.notes && (
              <Text style={styles.experimentNotes} numberOfLines={2}>
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
                  <Text style={styles.moreTagsText}>
                    +{item.tags.length - 3}
                  </Text>
                )}
              </View>
            )}
            <Text style={styles.experimentDate}>
              {new Date(item.date).toLocaleDateString("ko-KR")}
            </Text>
          </TouchableOpacity>
        </BlurView>
      );
    },
    [navigation]
  );

  // 통합 리스트 데이터 생성
  const listData = React.useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];

    // 프로젝트 섹션
    if (projects.length > 0) {
      items.push({
        type: "header",
        data: {
          title: isSearching
            ? `검색된 프로젝트 (${projects.length})`
            : "프로젝트",
        },
      });
      projects.forEach((project) => {
        items.push({ type: "project", data: project });
      });
    }

    // 실험 섹션
    const experimentsToShow = isSearching
      ? experiments
      : experiments.slice(0, 10);
    if (experimentsToShow.length > 0) {
      items.push({
        type: "header",
        data: {
          title: isSearching
            ? `검색된 실험 (${experiments.length})`
            : `최근 실험 (${experiments.length})`,
        },
      });
      experimentsToShow.forEach((experiment) => {
        items.push({ type: "experiment", data: experiment });
      });
    }

    return items;
  }, [projects, experiments, isSearching]);

  const renderItem = React.useCallback(
    ({ item, index }: { item: ListItem; index: number }) => {
      switch (item.type) {
        case "header": {
          const isFirstHeader = index === 0;
          return (
            <View
              style={[
                styles.sectionHeader,
                isFirstHeader && styles.sectionHeaderFirst,
              ]}
            >
              <Text style={styles.sectionTitle}>{item.data.title}</Text>
            </View>
          );
        }
        case "project":
          return renderProjectItem({ item: item.data });
        case "experiment":
          return renderExperimentItem({ item: item.data });
        default:
          return null;
      }
    },
    [renderProjectItem, renderExperimentItem]
  );

  return (
    <GradientBackground>
      <View
        style={[styles.topContainer, { paddingTop: insets.top + spacing.xl }]}
      >
        <View style={styles.searchContainer}>
          <BlurView intensity={20} style={styles.searchInputBlur}>
            <TextInput
              style={styles.searchInput}
              placeholder="프로젝트명, 실험 제목, 태그로 검색"
              placeholderTextColor={colors.text.white70}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {loading && (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={styles.searchLoader}
              />
            )}
          </BlurView>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={styles.profileButton}
        >
          <Image
            source={require("../../assets/profile.png")}
            style={styles.profileIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => {
          if (item.type === "header") {
            return `header-${item.data.title}`;
          }
          return `${item.type}-${item.data.id}`;
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isSearching ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>프로젝트가 없습니다</Text>
              <Text style={styles.emptySubtext}>
                + 버튼을 눌러 첫 프로젝트를 생성하세요
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate("ProjectEdit", { projectId: undefined })
        }
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </GradientBackground>
  );
}

// 프로젝트 카드 컴포넌트
function ProjectCard({
  project,
  navigation,
  onDelete,
  experimentCount,
}: {
  project: Project;
  navigation: ProjectListScreenNavigationProp;
  onDelete: (projectId: string) => void;
  experimentCount: number;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [showDelete, setShowDelete] = useState(false);
  const [cardHeight, setCardHeight] = useState<number | null>(null);
  const currentTranslateX = useRef(0); // 현재 translateX 값을 추적

  // 컴포넌트 언마운트 시 애니메이션 리셋
  useEffect(() => {
    return () => {
      currentTranslateX.current = 0;
      translateX.setValue(0);
      setShowDelete(false);
    };
  }, []);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 수평 스와이프 감지 (수직보다 수평이 더 크고, 최소 10px 이상)
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 10
        );
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
    onDelete(project.id);
    // 삭제 후 애니메이션 리셋
    currentTranslateX.current = 0;
    translateX.setValue(0);
    setShowDelete(false);
  };

  const handleCardPress = () => {
    if (showDelete) {
      // 삭제 버튼이 보이면 닫기
      currentTranslateX.current = 0;
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start(() => {
        currentTranslateX.current = 0;
      });
      setShowDelete(false);
    } else {
      // 카드 클릭
      navigation.navigate("ProjectDetail", {
        projectId: project.id,
        projectName: project.name,
      });
    }
  };

  const handleCardWrapperLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      setCardHeight(height);
    }
  };

  return (
    <View style={projectCardStyles.cardContainer}>
      {/* 삭제 버튼 (카드 뒤에 배치, showDelete가 true일 때만 표시) */}
      {showDelete && cardHeight !== null && (
        <View
          style={[
            projectCardStyles.deleteButtonContainer,
            { height: cardHeight },
          ]}
        >
          <TouchableOpacity
            style={[projectCardStyles.deleteButton, { height: cardHeight }]}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Text style={projectCardStyles.deleteButtonText}>삭제</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 카드 (앞에 배치, 스와이프 가능) */}
      <Animated.View
        style={[
          projectCardStyles.cardWrapper,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <BlurView
          intensity={20}
          style={projectCardStyles.projectCardBlur}
          onLayout={handleCardWrapperLayout}
        >
          <TouchableOpacity
            style={projectCardStyles.projectCard}
            onPress={handleCardPress}
            onLongPress={handleLongPress}
            activeOpacity={0.7}
          >
            <View style={projectCardStyles.cardHeader}>
              <Text style={projectCardStyles.projectName} numberOfLines={1}>
                {project.name}
              </Text>
              <Text style={projectCardStyles.experimentCount}>
                {experimentCount}개 실험
              </Text>
            </View>
            {project.description && (
              <Text
                style={projectCardStyles.projectDescription}
                numberOfLines={2}
              >
                {project.description}
              </Text>
            )}
            <Text style={projectCardStyles.projectDate}>
              최근 업데이트: {formatDate(project.updatedAt)}
            </Text>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </View>
  );
}
