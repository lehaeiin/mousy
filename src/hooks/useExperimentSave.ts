import { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { saveExperiment } from "../services/syncService";
import type { RootStackParamList } from "../navigation/AppNavigator";
import type { Experiment } from "../types/experiment";

type ExperimentSaveNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ExperimentEdit"
>;

type UseExperimentSaveParams = {
  projectId: string;
  experimentId?: string;
  buildExperiment: (projectId: string, experimentId?: string) => Experiment;
};

export function useExperimentSave({
  projectId,
  experimentId,
  buildExperiment,
}: UseExperimentSaveParams) {
  const navigation = useNavigation<ExperimentSaveNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);

  const save = async () => {
    setIsLoading(true);
    try {
      const experiment = buildExperiment(projectId, experimentId);
      const result = await saveExperiment(experiment);

      const message = result.synced
        ? "실험이 저장되었습니다."
        : "실험이 로컬에 저장되었습니다. 네트워크 연결 시 자동으로 동기화됩니다.";

      Alert.alert("저장 완료", message, [
        {
          text: "확인",
          onPress: () => {
            if (experimentId) {
              navigation.navigate("ExperimentDetail", {
                experimentId: experimentId,
              });
            } else {
              navigation.goBack();
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

  return { save, isLoading };
}





