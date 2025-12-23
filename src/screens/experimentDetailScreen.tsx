import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Image,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  getExperiment,
  deleteExperiment,
  getProject,
} from "../services/supabaseStorage";
import { Experiment } from "../types/experiment";
import type { RootStackParamList } from "../navigation/AppNavigator";
import GradientBackground from "../components/gradientBackground";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { commonStyles } from "../styles/common";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../styles/theme";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

type ExperimentDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ExperimentDetail"
>;

type RouteParams = {
  experimentId: string;
};

export default function ExperimentDetailScreen() {
  const navigation = useNavigation<ExperimentDetailScreenNavigationProp>();
  const route = useRoute();
  const params = route.params as RouteParams;
  const { experimentId } = params;
  const insets = useSafeAreaInsets();

  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projectName, setProjectName] = useState<string>("");

  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      loadExperiment();
    }, [experimentId])
  );

  useEffect(() => {
    if (experiment?.projectId) {
      loadProjectName();
    }
  }, [experiment?.projectId]);

  const loadExperiment = async () => {
    try {
      const data = await getExperiment(experimentId);
      setExperiment(data);
    } catch (error) {
      console.error("실험 로드 실패:", error);
      Alert.alert("오류", "실험을 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectName = async () => {
    if (!experiment?.projectId) return;
    try {
      const project = await getProject(experiment.projectId);
      if (project) {
        setProjectName(project.name);
      }
    } catch (error) {
      console.error("프로젝트 이름 로드 실패:", error);
    }
  };

  const handleDelete = () => {
    Alert.alert("삭제 확인", "이 실험을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteExperiment(experimentId);
            Alert.alert("삭제 완료", "실험이 삭제되었습니다.", [
              {
                text: "확인",
                onPress: () => navigation.goBack(),
              },
            ]);
          } catch (error) {
            console.error("삭제 실패:", error);
            Alert.alert("오류", "삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      case "planning":
        return "계획";
      case "failed":
        return "실패";
      default:
        return "";
    }
  };

  const formatExperimentForShare = (exp: Experiment): string => {
    let text = `실험 정보\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // 기본 정보
    text += `제목: ${exp.title}\n`;
    if (projectName) {
      text += `프로젝트: ${projectName}\n`;
    }
    text += `실험 단계: ${
      exp.stage === "in-vivo"
        ? "in vivo"
        : exp.stage === "in-vitro"
        ? "in vitro"
        : "characterization"
    }\n`;
    if (exp.method) {
      text += `실험 방법: ${exp.method}\n`;
    }
    text += `상태: ${getStatusText(exp.status)}\n`;
    text += `작성일: ${formatDate(exp.createdAt)}\n`;
    if (exp.sampleId) {
      text += `샘플 ID: ${exp.sampleId}\n`;
    }
    text += `\n`;

    // 노트
    if (exp.notes) {
      text += `노트:\n${exp.notes}\n\n`;
    }

    // In-vivo 정보
    if (exp.stage === "in-vivo" && exp.inVivoMetadata) {
      const meta = exp.inVivoMetadata;

      // 동물 정보
      if (meta.animalInfo) {
        text += `[동물 개체 기본 정보]\n`;
        if (meta.animalInfo.strain) {
          text += `종/계통: ${meta.animalInfo.strain}\n`;
        }
        if (meta.animalInfo.sex) {
          text += `성별: ${
            meta.animalInfo.sex === "male"
              ? "수컷"
              : meta.animalInfo.sex === "female"
              ? "암컷"
              : "미상"
          }\n`;
        }
        if (meta.animalInfo.ageWeeks) {
          text += `나이: ${meta.animalInfo.ageWeeks}주령\n`;
        }
        if (meta.animalInfo.genotype) {
          text += `유전형: ${meta.animalInfo.genotype}\n`;
        }
        if (meta.animalInfo.vendor) {
          text += `공급업체: ${meta.animalInfo.vendor}\n`;
        }
        text += `\n`;
      }

      // 처치 정보
      if (meta.treatment) {
        text += `[처치 정보]\n`;
        if (meta.treatment.substanceName) {
          text += `투여 물질: ${meta.treatment.substanceName}\n`;
        }
        if (meta.treatment.dose) {
          text += `용량: ${meta.treatment.dose}${
            meta.treatment.doseUnit ? ` ${meta.treatment.doseUnit}` : ""
          }\n`;
        }
        if (meta.treatment.volume) {
          text += `투여 부피: ${meta.treatment.volume}${
            meta.treatment.volumeUnit ? ` ${meta.treatment.volumeUnit}` : ""
          }\n`;
        }
        if (meta.treatment.vehicle) {
          text += `Buffer: ${meta.treatment.vehicle}\n`;
        }
        if (meta.treatment.route) {
          const routeText =
            meta.treatment.route === "oral"
              ? "경구"
              : meta.treatment.route === "ip"
              ? "복강"
              : meta.treatment.route === "iv"
              ? "정맥"
              : meta.treatment.route === "sc"
              ? "피하"
              : meta.treatment.route === "im"
              ? "근육"
              : meta.treatment.route === "topical"
              ? "국소"
              : meta.treatment.routeOther || "기타";
          text += `투여 경로: ${routeText}\n`;
        }
        if (meta.treatment.frequency) {
          text += `투여 빈도: ${meta.treatment.frequency}\n`;
        }
        text += `\n`;
      }

      // 실험 디자인
      if (
        meta.experimentalDesign?.groups &&
        meta.experimentalDesign.groups.length > 0
      ) {
        text += `[실험 디자인]\n`;
        meta.experimentalDesign.groups.forEach((group) => {
          text += `그룹 ${group.groupNumber}`;
          if (group.groupName) {
            text += ` (${group.groupName})`;
          }
          if (group.n) {
            text += `: ${group.n}마리`;
          }
          if (group.characteristics) {
            text += ` - ${group.characteristics}`;
          }
          text += `\n`;
        });
        text += `\n`;
      }

      // 환경 정보
      if (meta.environment?.food) {
        text += `[환경 조건]\n`;
        text += `사료: ${meta.environment.food}\n\n`;
      }
    }

    // In-vitro 정보
    if (exp.stage === "in-vitro" && exp.inVitroMetadata) {
      const meta = exp.inVitroMetadata;

      if (meta.cellInfo) {
        text += `[Cell Information]\n`;
        if (meta.cellInfo.cellName) {
          text += `Cell Name: ${meta.cellInfo.cellName}\n`;
        }
        if (meta.cellInfo.origin) {
          text += `Origin: ${meta.cellInfo.origin}\n`;
        }
        if (meta.cellInfo.vendor) {
          text += `판매처: ${meta.cellInfo.vendor}\n`;
        }
        if (meta.cellInfo.media) {
          text += `Media: ${meta.cellInfo.media}\n`;
        }
        if (meta.cellInfo.wellType) {
          text += `Well Type: ${meta.cellInfo.wellType}\n`;
        }
        if (meta.cellCount?.coefficient && meta.cellCount?.exponent) {
          text += `Cell Count: ${meta.cellCount.coefficient} × 10^${meta.cellCount.exponent}\n`;
        }
        text += `\n`;
      }

      if (
        meta.experimentalDesign?.groups &&
        meta.experimentalDesign.groups.length > 0
      ) {
        text += `[실험 디자인 및 그룹 정보]\n`;
        meta.experimentalDesign.groups.forEach((group) => {
          text += `그룹 ${group.groupNumber}`;
          if (group.groupName) {
            text += ` (${group.groupName})`;
          }
          if (group.n) {
            text += `: n=${group.n}`;
          }
          if (group.characteristics) {
            text += ` - ${group.characteristics}`;
          }
          text += `\n`;
        });
        text += `\n`;
      }
    }

    // 태그
    if (exp.tags && exp.tags.length > 0) {
      text += `태그: ${exp.tags.join(", ")}\n`;
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `mousy - 실험 노트 앱`;

    return text;
  };

  const formatExperimentForPDF = (exp: Experiment): string => {
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      padding: 40px;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
      margin-bottom: 15px;
      font-size: 1.3em;
      border-left: 4px solid #3498db;
      padding-left: 10px;
    }
    .header {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .label {
      font-weight: 600;
      color: #555;
      min-width: 120px;
    }
    .value {
      color: #2c3e50;
    }
    .section {
      margin-bottom: 25px;
      padding: 20px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 15px;
    }
    .info-item {
      margin-bottom: 15px;
    }
    .info-item-full {
      grid-column: 1 / -1;
    }
    .notes {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      white-space: pre-wrap;
      margin-top: 10px;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    .tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 0.9em;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.9em;
      font-weight: 600;
    }
    .status-completed { background: #4caf50; color: white; }
    .status-in-progress { background: #ff9800; color: white; }
    .status-planning { background: #2196f3; color: white; }
    .status-failed { background: #f44336; color: white; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      color: #888;
      font-size: 0.9em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    table th, table td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    table th {
      background: #f5f5f5;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(exp.title)}</h1>
  
  <div class="header">
    <div class="header-row">
      <span class="label">프로젝트:</span>
      <span class="value">${projectName || "N/A"}</span>
    </div>
    <div class="header-row">
      <span class="label">실험 단계:</span>
      <span class="value">${
        exp.stage === "in-vivo"
          ? "in vivo"
          : exp.stage === "in-vitro"
          ? "in vitro"
          : "characterization"
      }</span>
    </div>
    ${
      exp.method
        ? `<div class="header-row">
      <span class="label">실험 방법:</span>
      <span class="value">${escapeHtml(exp.method)}</span>
    </div>`
        : ""
    }
    <div class="header-row">
      <span class="label">상태:</span>
      <span class="value">
        <span class="status-badge status-${exp.status}">${getStatusText(
      exp.status
    )}</span>
      </span>
    </div>
    <div class="header-row">
      <span class="label">작성일:</span>
      <span class="value">${formatDate(exp.createdAt)}</span>
    </div>
    ${
      exp.sampleId
        ? `<div class="header-row">
      <span class="label">샘플 ID:</span>
      <span class="value">${escapeHtml(exp.sampleId)}</span>
    </div>`
        : ""
    }
  </div>
`;

    // 노트
    if (exp.notes) {
      html += `
  <div class="section">
    <h2>노트</h2>
    <div class="notes">${escapeHtml(exp.notes)}</div>
  </div>
`;
    }

    // In-vivo 정보
    if (exp.stage === "in-vivo" && exp.inVivoMetadata) {
      const meta = exp.inVivoMetadata;

      // 동물 정보
      if (meta.animalInfo) {
        html += `
  <div class="section">
    <h2>1. 동물 개체 기본 정보</h2>
    <div class="info-grid">
`;
        if (meta.animalInfo.strain) {
          html += `
      <div class="info-item">
        <div class="label">종/계통:</div>
        <div class="value">${escapeHtml(meta.animalInfo.strain)}</div>
      </div>
`;
        }
        if (meta.animalInfo.sex) {
          html += `
      <div class="info-item">
        <div class="label">성별:</div>
        <div class="value">${
          meta.animalInfo.sex === "male"
            ? "수컷"
            : meta.animalInfo.sex === "female"
            ? "암컷"
            : "미상"
        }</div>
      </div>
`;
        }
        if (meta.animalInfo.ageWeeks) {
          html += `
      <div class="info-item">
        <div class="label">나이 (주령):</div>
        <div class="value">${meta.animalInfo.ageWeeks}주령</div>
      </div>
`;
        }
        if (meta.animalInfo.genotype) {
          html += `
      <div class="info-item">
        <div class="label">유전형:</div>
        <div class="value">${escapeHtml(meta.animalInfo.genotype)}</div>
      </div>
`;
        }
        if (meta.animalInfo.vendor) {
          html += `
      <div class="info-item">
        <div class="label">공급업체:</div>
        <div class="value">${escapeHtml(meta.animalInfo.vendor)}</div>
      </div>
`;
        }
        html += `
    </div>
  </div>
`;
      }

      // 처치 정보
      if (meta.treatment) {
        html += `
  <div class="section">
    <h2>2. 처치(약물·물질) 정보</h2>
    <div class="info-grid">
`;
        if (meta.treatment.substanceName) {
          html += `
      <div class="info-item">
        <div class="label">투여 물질:</div>
        <div class="value">${escapeHtml(meta.treatment.substanceName)}</div>
      </div>
`;
        }
        if (meta.treatment.dose) {
          html += `
      <div class="info-item">
        <div class="label">용량:</div>
        <div class="value">${meta.treatment.dose}${
            meta.treatment.doseUnit
              ? ` ${escapeHtml(meta.treatment.doseUnit)}`
              : ""
          }</div>
      </div>
`;
        }
        if (meta.treatment.volume) {
          html += `
      <div class="info-item">
        <div class="label">투여 부피:</div>
        <div class="value">${meta.treatment.volume}${
            meta.treatment.volumeUnit
              ? ` ${escapeHtml(meta.treatment.volumeUnit)}`
              : ""
          }</div>
      </div>
`;
        }
        if (meta.treatment.vehicle) {
          html += `
      <div class="info-item">
        <div class="label">Buffer:</div>
        <div class="value">${escapeHtml(meta.treatment.vehicle)}</div>
      </div>
`;
        }
        if (meta.treatment.route) {
          const routeText =
            meta.treatment.route === "oral"
              ? "경구"
              : meta.treatment.route === "ip"
              ? "복강"
              : meta.treatment.route === "iv"
              ? "정맥"
              : meta.treatment.route === "sc"
              ? "피하"
              : meta.treatment.route === "im"
              ? "근육"
              : meta.treatment.route === "topical"
              ? "국소"
              : meta.treatment.routeOther || "기타";
          html += `
      <div class="info-item">
        <div class="label">투여 경로:</div>
        <div class="value">${escapeHtml(routeText)}</div>
      </div>
`;
        }
        if (meta.treatment.frequency) {
          html += `
      <div class="info-item">
        <div class="label">투여 빈도:</div>
        <div class="value">${escapeHtml(meta.treatment.frequency)}</div>
      </div>
`;
        }
        html += `
    </div>
  </div>
`;
      }

      // 실험 디자인
      if (
        meta.experimentalDesign?.groups &&
        meta.experimentalDesign.groups.length > 0
      ) {
        html += `
  <div class="section">
    <h2>3. 실험 디자인 및 그룹 정보</h2>
    <table>
      <thead>
        <tr>
          <th>그룹 번호</th>
          <th>그룹명</th>
          <th>마리 수</th>
          <th>특징</th>
        </tr>
      </thead>
      <tbody>
`;
        meta.experimentalDesign.groups.forEach((group) => {
          html += `
        <tr>
          <td>${group.groupNumber}</td>
          <td>${group.groupName || "-"}</td>
          <td>${group.n || "-"}</td>
          <td>${group.characteristics || "-"}</td>
        </tr>
`;
        });
        html += `
      </tbody>
    </table>
  </div>
`;
      }

      // 환경 정보
      if (meta.environment?.food) {
        html += `
  <div class="section">
    <h2>4. 환경·실험 조건</h2>
    <div class="info-item">
      <div class="label">사료:</div>
      <div class="value">${escapeHtml(meta.environment.food)}</div>
    </div>
  </div>
`;
      }
    }

    // In-vitro 정보
    if (exp.stage === "in-vitro" && exp.inVitroMetadata) {
      const meta = exp.inVitroMetadata;

      if (meta.cellInfo) {
        html += `
  <div class="section">
    <h2>1. Cell Information</h2>
    <div class="info-grid">
`;
        if (meta.cellInfo.cellName) {
          html += `
      <div class="info-item">
        <div class="label">Cell Name:</div>
        <div class="value">${escapeHtml(meta.cellInfo.cellName)}</div>
      </div>
`;
        }
        if (meta.cellInfo.origin) {
          html += `
      <div class="info-item">
        <div class="label">Origin:</div>
        <div class="value">${escapeHtml(meta.cellInfo.origin)}</div>
      </div>
`;
        }
        if (meta.cellInfo.vendor) {
          html += `
      <div class="info-item">
        <div class="label">판매처:</div>
        <div class="value">${escapeHtml(meta.cellInfo.vendor)}</div>
      </div>
`;
        }
        if (meta.cellInfo.media) {
          html += `
      <div class="info-item">
        <div class="label">Media:</div>
        <div class="value">${escapeHtml(meta.cellInfo.media)}</div>
      </div>
`;
        }
        if (meta.cellInfo.wellType) {
          html += `
      <div class="info-item">
        <div class="label">Well Type:</div>
        <div class="value">${escapeHtml(meta.cellInfo.wellType)}</div>
      </div>
`;
        }
        if (meta.cellCount?.coefficient && meta.cellCount?.exponent) {
          html += `
      <div class="info-item">
        <div class="label">Cell Count:</div>
        <div class="value">${meta.cellCount.coefficient} × 10^${meta.cellCount.exponent}</div>
      </div>
`;
        }
        html += `
    </div>
  </div>
`;
      }

      if (
        meta.experimentalDesign?.groups &&
        meta.experimentalDesign.groups.length > 0
      ) {
        html += `
  <div class="section">
    <h2>2. 실험 디자인 및 그룹 정보</h2>
    <table>
      <thead>
        <tr>
          <th>그룹 번호</th>
          <th>그룹명</th>
          <th>n</th>
          <th>특징</th>
        </tr>
      </thead>
      <tbody>
`;
        meta.experimentalDesign.groups.forEach((group) => {
          html += `
        <tr>
          <td>${group.groupNumber}</td>
          <td>${group.groupName || "-"}</td>
          <td>${group.n !== undefined ? group.n : "-"}</td>
          <td>${group.characteristics || "-"}</td>
        </tr>
`;
        });
        html += `
      </tbody>
    </table>
  </div>
`;
      }
    }

    // 태그
    if (exp.tags && exp.tags.length > 0) {
      html += `
  <div class="section">
    <h2>태그</h2>
    <div class="tags">
`;
      exp.tags.forEach((tag) => {
        html += `<span class="tag">${escapeHtml(tag)}</span>`;
      });
      html += `
    </div>
  </div>
`;
    }

    html += `
  <div class="footer">
    <p>mousy - 실험 노트 앱</p>
    <p>생성일: ${formatDate(new Date())}</p>
  </div>
</body>
</html>
`;

    return html;
  };

  const handleSharePDF = async () => {
    if (!experiment) return;

    try {
      Alert.alert("PDF 생성", "PDF를 생성하는 중입니다...", [], {
        cancelable: false,
      });

      const html = formatExperimentForPDF(experiment);

      // PDF 생성
      const { uri } = await Print.printToFileAsync({
        html: html,
        base64: false,
      });

      // 파일명 생성: 프로젝트이름_YYYYMMDD.pdf
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(
        now.getMonth() + 1
      ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

      // 프로젝트 이름에서 파일명에 사용할 수 없는 문자 제거
      const safeProjectName = (projectName || "실험")
        .replace(/[^a-zA-Z0-9가-힣\s]/g, "_")
        .replace(/\s+/g, "_")
        .substring(0, 50); // 파일명 길이 제한

      const fileName = `${safeProjectName}_${dateStr}.pdf`;

      // documentDirectory 사용 (legacy API)
      const documentDir = FileSystem.documentDirectory || "";
      const newUri = `${documentDir}${fileName}`;

      // 파일 복사 (원하는 이름으로) - legacy API 사용
      await FileSystem.copyAsync({
        from: uri,
        to: newUri,
      });

      // 공유 가능한지 확인
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(newUri, {
          mimeType: "application/pdf",
          dialogTitle: "실험 정보 PDF 공유",
          UTI: "com.adobe.pdf",
        });
        Alert.alert("성공", "PDF가 생성되었습니다.");
      } else {
        Alert.alert("오류", "이 기기에서는 공유 기능을 사용할 수 없습니다.");
      }
    } catch (error: any) {
      console.error("PDF 생성 실패:", error);
      Alert.alert("오류", "PDF 생성에 실패했습니다: " + error.message);
    }
  };

  const handleShare = async () => {
    if (!experiment) return;

    try {
      const shareText = formatExperimentForShare(experiment);
      const result = await Share.share({
        message: shareText,
        title: experiment.title,
      });

      if (result.action === Share.sharedAction) {
        // 공유 완료
      } else if (result.action === Share.dismissedAction) {
        // 공유 취소
      }
    } catch (error: any) {
      console.error("공유 실패:", error);
      Alert.alert("오류", "공유에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </GradientBackground>
    );
  }

  if (!experiment) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>실험을 찾을 수 없습니다</Text>
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
        <Text style={styles.topHeaderTitle}>실험 상세</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleSharePDF} style={styles.shareButton}>
            <Text style={styles.shareButtonText}>PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (experiment.projectId) {
                navigation.navigate("ExperimentEdit", {
                  projectId: experiment.projectId,
                  experimentId: experiment.id,
                });
              }
            }}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>수정</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* 헤더 - BlurView 제거, 제목만 표시 */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>{experiment.title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(experiment.status) },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {getStatusText(experiment.status)}
              </Text>
            </View>
          </View>
          {experiment.experimentType && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {experiment.experimentType}
              </Text>
            </View>
          )}
        </View>

        {/* 메타 정보 */}
        <BlurView intensity={20} style={styles.metaSectionBlur}>
          <View style={styles.metaSection}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>작성일</Text>
              <Text style={styles.metaValue}>
                {formatDate(experiment.createdAt)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>수정일</Text>
              <Text style={styles.metaValue}>
                {formatDate(experiment.updatedAt)}
              </Text>
            </View>
            {experiment.sampleId && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>샘플 ID</Text>
                <Text style={styles.metaValue}>{experiment.sampleId}</Text>
              </View>
            )}
          </View>
        </BlurView>

        {/* 노트 */}
        {experiment.notes && (
          <BlurView intensity={20} style={styles.sectionBlur}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>노트</Text>
              <View style={styles.notesContainer}>
                <Text style={styles.notesText}>{experiment.notes}</Text>
              </View>
            </View>
          </BlurView>
        )}

        {/* In-vivo 상세 정보 */}
        {experiment.stage === "in-vivo" && experiment.inVivoMetadata && (
          <>
            {/* 1. 동물 개체 기본 정보 */}
            {experiment.inVivoMetadata.animalInfo && (
              <BlurView intensity={20} style={styles.sectionBlur}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    1. 동물 개체 기본 정보
                  </Text>
                  <View style={styles.infoGrid}>
                    {experiment.inVivoMetadata.animalInfo.strain && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>종/계통</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVivoMetadata.animalInfo.strain}
                        </Text>
                      </View>
                    )}
                    {experiment.inVivoMetadata.animalInfo.sex && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>성별</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVivoMetadata.animalInfo.sex === "male"
                            ? "수컷"
                            : experiment.inVivoMetadata.animalInfo.sex ===
                              "female"
                            ? "암컷"
                            : "미상"}
                        </Text>
                      </View>
                    )}
                    {experiment.inVivoMetadata.animalInfo.ageWeeks && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>나이 (주령)</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVivoMetadata.animalInfo.ageWeeks}주령
                        </Text>
                      </View>
                    )}
                    {experiment.inVivoMetadata.animalInfo.genotype && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>유전형</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVivoMetadata.animalInfo.genotype}
                        </Text>
                      </View>
                    )}
                    {experiment.inVivoMetadata.animalInfo.isTransgenic !==
                      undefined && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>트랜스제닉</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVivoMetadata.animalInfo.isTransgenic
                            ? "예"
                            : "아니오"}
                        </Text>
                      </View>
                    )}
                    {experiment.inVivoMetadata.animalInfo.isKnockout !==
                      undefined && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>노크아웃</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVivoMetadata.animalInfo.isKnockout
                            ? "예"
                            : "아니오"}
                        </Text>
                      </View>
                    )}
                    {experiment.inVivoMetadata.animalInfo.vendor && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>공급업체</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVivoMetadata.animalInfo.vendor}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </BlurView>
            )}

            {/* 2. 처치 정보 */}
            {experiment.inVivoMetadata.treatment && (
              <BlurView intensity={20} style={styles.sectionBlur}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    2. 처치(약물·물질) 정보
                  </Text>
                  <View style={styles.infoGrid}>
                    {experiment.inVivoMetadata.treatment.substanceName && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>투여 물질</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVivoMetadata.treatment.substanceName}
                        </Text>
                      </View>
                    )}
                    {experiment.inVivoMetadata.treatment.dose && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>용량</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVivoMetadata.treatment.dose}
                          {experiment.inVivoMetadata.treatment.doseUnit
                            ? ` ${experiment.inVivoMetadata.treatment.doseUnit}`
                            : ""}
                        </Text>
                      </View>
                    )}
                    {experiment.inVivoMetadata.treatment.volume && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>투여 부피</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVivoMetadata.treatment.volume}
                          {experiment.inVivoMetadata.treatment.volumeUnit
                            ? ` ${experiment.inVivoMetadata.treatment.volumeUnit}`
                            : ""}
                        </Text>
                      </View>
                    )}
                    {experiment.inVivoMetadata.treatment.vehicle && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Buffer</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVivoMetadata.treatment.vehicle}
                        </Text>
                      </View>
                    )}
                    {experiment.inVivoMetadata.treatment.route && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>투여 경로</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVivoMetadata.treatment.route === "oral"
                            ? "경구"
                            : experiment.inVivoMetadata.treatment.route === "ip"
                            ? "복강"
                            : experiment.inVivoMetadata.treatment.route === "iv"
                            ? "정맥"
                            : experiment.inVivoMetadata.treatment.route === "sc"
                            ? "피하"
                            : experiment.inVivoMetadata.treatment.route === "im"
                            ? "근육"
                            : experiment.inVivoMetadata.treatment.route ===
                              "topical"
                            ? "국소"
                            : experiment.inVivoMetadata.treatment.routeOther ||
                              "기타"}
                        </Text>
                      </View>
                    )}
                    {experiment.inVivoMetadata.treatment.frequency && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>투여 빈도</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVivoMetadata.treatment.frequency}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </BlurView>
            )}

            {/* 3. 실험 디자인 */}
            {experiment.inVivoMetadata.experimentalDesign && (
              <BlurView intensity={20} style={styles.sectionBlur}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    3. 실험 디자인 및 그룹 정보
                  </Text>
                  {/* 그룹 정보 */}
                  {experiment.inVivoMetadata.experimentalDesign.groups &&
                    experiment.inVivoMetadata.experimentalDesign.groups.length >
                      0 && (
                      <View style={styles.groupsContainer}>
                        {experiment.inVivoMetadata.experimentalDesign.groups.map(
                          (group, index) => (
                            <View key={index} style={styles.groupCard}>
                              <View style={styles.groupHeader}>
                                <Text style={styles.groupHeaderText}>
                                  그룹 {group.groupNumber}
                                  {group.groupName && `: ${group.groupName}`}
                                </Text>
                              </View>
                              <View style={styles.groupContent}>
                                {group.n !== undefined && (
                                  <View style={styles.infoItem}>
                                    <Text style={styles.infoLabel}>
                                      마리 수
                                    </Text>
                                    <Text style={styles.infoValue}>
                                      {group.n}마리
                                    </Text>
                                  </View>
                                )}
                                {group.characteristics && (
                                  <View style={styles.infoItemFull}>
                                    <Text style={styles.infoLabel}>특징</Text>
                                    <Text style={styles.infoValue}>
                                      {group.characteristics}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          )
                        )}
                      </View>
                    )}
                </View>
              </BlurView>
            )}

            {/* 4. 환경 정보 */}
            {experiment.inVivoMetadata.environment && (
              <BlurView intensity={20} style={styles.sectionBlur}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>4. 환경·실험 조건</Text>
                  <View style={styles.infoGrid}>
                    {experiment.inVivoMetadata.environment.food && (
                      <View style={styles.infoItemFull}>
                        <Text style={styles.infoLabel}>사료</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVivoMetadata.environment.food}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </BlurView>
            )}
          </>
        )}

        {/* Characterization 정보 */}
        {experiment.stage === "characterization" &&
          experiment.characterizationMetadata && (
            <>
              {/* 물질 정보 */}
              {experiment.characterizationMetadata.treatment?.substances &&
                experiment.characterizationMetadata.treatment.substances
                  .length > 0 && (
                  <BlurView intensity={20} style={styles.sectionBlur}>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>물질 정보</Text>
                      <View style={styles.infoGrid}>
                        {experiment.characterizationMetadata.treatment.substances.map(
                          (substance, index) => (
                            <View key={index} style={styles.infoItemFull}>
                              <Text style={styles.infoLabel}>
                                물질 {index + 1}
                                {substance.substanceName &&
                                  `: ${substance.substanceName}`}
                              </Text>
                              <View>
                                {substance.cat && (
                                  <Text style={styles.infoValue}>
                                    Cat#: {substance.cat}
                                  </Text>
                                )}
                                {substance.manufacturer && (
                                  <Text style={styles.infoValue}>
                                    제조회사: {substance.manufacturer}
                                  </Text>
                                )}
                              </View>
                            </View>
                          )
                        )}
                      </View>
                    </View>
                  </BlurView>
                )}
            </>
          )}

        {/* In-vitro 정보 */}
        {experiment.stage === "in-vitro" && experiment.inVitroMetadata && (
          <>
            {/* 1. Cell 정보 */}
            {experiment.inVitroMetadata.cellInfo && (
              <BlurView intensity={20} style={styles.sectionBlur}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>1. Cell Information</Text>
                  <View style={styles.infoGrid}>
                    {experiment.inVitroMetadata.cellInfo.cellName && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Cell Name</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVitroMetadata.cellInfo.cellName}
                        </Text>
                      </View>
                    )}
                    {experiment.inVitroMetadata.cellInfo.origin && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Origin</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVitroMetadata.cellInfo.origin}
                        </Text>
                      </View>
                    )}
                    {experiment.inVitroMetadata.cellInfo.vendor && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>판매처</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVitroMetadata.cellInfo.vendor}
                        </Text>
                      </View>
                    )}
                    {experiment.inVitroMetadata.cellInfo.media && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Media</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVitroMetadata.cellInfo.media}
                        </Text>
                      </View>
                    )}
                    {experiment.inVitroMetadata.cellInfo.wellType && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Well Type</Text>
                        <Text style={styles.infoValue}>
                          {experiment.inVitroMetadata.cellInfo.wellType}
                        </Text>
                      </View>
                    )}
                    {experiment.inVitroMetadata.cellCount?.coefficient &&
                      experiment.inVitroMetadata.cellCount?.exponent && (
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel}>Cell Count</Text>
                          <Text style={styles.infoValue}>
                            {experiment.inVitroMetadata.cellCount.coefficient} ×
                            10^{experiment.inVitroMetadata.cellCount.exponent}
                          </Text>
                        </View>
                      )}
                  </View>
                </View>
              </BlurView>
            )}

            {/* 2. 그룹 정보 */}
            {experiment.inVitroMetadata.experimentalDesign?.groups &&
              experiment.inVitroMetadata.experimentalDesign.groups.length >
                0 && (
                <BlurView intensity={20} style={styles.sectionBlur}>
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      2. 실험 디자인 및 그룹 정보
                    </Text>
                    <View style={styles.groupsContainer}>
                      {experiment.inVitroMetadata.experimentalDesign.groups.map(
                        (group, index) => (
                          <View key={index} style={styles.groupCard}>
                            <View style={styles.groupHeader}>
                              <Text style={styles.groupHeaderText}>
                                그룹 {group.groupNumber}
                                {group.groupName && `: ${group.groupName}`}
                              </Text>
                            </View>
                            <View style={styles.groupContent}>
                              {group.n !== undefined && (
                                <View style={styles.infoItem}>
                                  <Text style={styles.infoLabel}>n</Text>
                                  <Text style={styles.infoValue}>
                                    {group.n}
                                  </Text>
                                </View>
                              )}
                              {group.characteristics && (
                                <View style={styles.infoItemFull}>
                                  <Text style={styles.infoLabel}>
                                    {experiment.stage === "in-vitro"
                                      ? "처리조건"
                                      : "특징"}
                                  </Text>
                                  <Text style={styles.infoValue}>
                                    {group.characteristics}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        )
                      )}
                    </View>
                  </View>
                </BlurView>
              )}
          </>
        )}

        {/* 태그 */}
        {experiment.tags.length > 0 && (
          <BlurView intensity={20} style={styles.sectionBlur}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>태그</Text>
              <View style={styles.tagsContainer}>
                {experiment.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </BlurView>
        )}

        {/* 이미지 */}
        {experiment.images.length > 0 && (
          <BlurView intensity={20} style={styles.sectionBlur}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                이미지 ({experiment.images.length})
              </Text>
              <View style={styles.imageGrid}>
                {experiment.images.map((imageUrl, index) => {
                  const file = experiment.files?.find(
                    (f) => f.url === imageUrl
                  );
                  return (
                    <View key={index} style={styles.imageItem}>
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                        onError={(error) => {
                          console.error(
                            `이미지 로드 실패 [${index}]:`,
                            imageUrl,
                            error.nativeEvent.error
                          );
                        }}
                      />
                      {file?.isLocal && (
                        <View style={styles.localBadge}>
                          <Text style={styles.localBadgeText}>오프라인</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </BlurView>
        )}

        {/* 파일 링크 */}
        {experiment.fileLinks && experiment.fileLinks.length > 0 && (
          <BlurView intensity={20} style={styles.sectionBlur}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>파일 링크</Text>
              {experiment.fileLinks.map((link, index) => (
                <TouchableOpacity key={index} style={styles.linkItem}>
                  <Text style={styles.linkText}>{link}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    ...commonStyles.scrollContent,
  },
  loadingContainer: {
    ...commonStyles.loadingContainer,
  },
  loadingText: {
    ...commonStyles.loadingText,
  },
  errorText: {
    ...commonStyles.errorText,
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
  headerActions: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  shareButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.white25,
  },
  shareButtonText: {
    fontSize: typography.sizes.base,
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
  },
  editButtonText: {
    fontSize: typography.sizes.base,
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: "transparent",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.sizes["4xl"],
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    marginRight: spacing.md,
    letterSpacing: -0.5,
  },
  statusBadge: {
    ...commonStyles.badge,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
  },
  statusBadgeText: {
    ...commonStyles.badgeText,
  },
  typeBadge: {
    ...commonStyles.tag,
    alignSelf: "flex-start",
  },
  typeBadgeText: {
    ...commonStyles.tagText,
  },
  metaSectionBlur: {
    ...commonStyles.glassContainer,
    marginBottom: spacing.lg,
  },
  metaSection: {
    ...commonStyles.glassCard,
    padding: spacing.xxl,
  },
  metaItem: {
    marginBottom: spacing.md,
  },
  metaLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.white70,
    marginBottom: spacing.xs + 2,
    fontWeight: typography.weights.medium,
  },
  metaValue: {
    fontSize: typography.sizes.lg,
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
  },
  sectionBlur: {
    ...commonStyles.glassContainer,
    marginBottom: spacing.lg,
  },
  section: {
    ...commonStyles.glassCard,
    padding: spacing.xxl,
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
  },
  notesContainer: {
    minHeight: 100,
  },
  notesText: {
    fontSize: typography.sizes.lg,
    color: colors.text.white90,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm + 2,
  },
  tag: {
    ...commonStyles.tag,
  },
  tagText: {
    ...commonStyles.tagText,
  },
  placeholderText: {
    fontSize: typography.sizes.md,
    color: colors.text.tertiary,
    fontStyle: "italic",
  },
  linkItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.white10,
  },
  linkText: {
    fontSize: typography.sizes.md,
    color: colors.info,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  infoItem: {
    width: "48%",
    marginBottom: spacing.md,
  },
  infoItemFull: {
    width: "100%",
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.white70,
    marginBottom: spacing.xs + 2,
    fontWeight: typography.weights.medium,
  },
  infoValue: {
    fontSize: typography.sizes.lg,
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  imageItem: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.background.white10,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  localBadge: {
    position: "absolute",
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  localBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
  },
  groupsContainer: {
    marginBottom: spacing.lg,
  },
  groupCard: {
    backgroundColor: colors.background.white90,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  groupHeader: {
    marginBottom: spacing.sm,
  },
  groupHeaderText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
  },
  groupContent: {
    marginTop: spacing.sm,
  },
});
