import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../styles/theme";
import { commonStyles } from "../styles/common";

type Group = {
  groupNumber: number;
  groupName?: string;
  characteristics?: string;
  n?: number; // in vivo 전용
};

type GroupsEditorProps = {
  groups: Group[] | undefined;
  onGroupsChange: (groups: Group[]) => void;
  showAnimalCount?: boolean; // in vivo인 경우 true
};

export default function GroupsEditor({
  groups = [],
  onGroupsChange,
  showAnimalCount = false,
}: GroupsEditorProps) {
  const [expandedGroupIndex, setExpandedGroupIndex] = useState<number | null>(
    null
  );

  const handleAddGroup = () => {
    const newGroupNumber =
      groups.length > 0
        ? Math.max(...groups.map((g) => g.groupNumber || 0)) + 1
        : 1;
    // 첫 번째 그룹의 n 값을 가져오기
    const firstGroupN = groups.length > 0 && showAnimalCount ? groups[0].n : undefined;
    const newGroups = [
      ...groups,
      {
        groupNumber: newGroupNumber,
        groupName: "",
        characteristics: "",
        ...(showAnimalCount ? { n: firstGroupN } : {}),
      },
    ];
    onGroupsChange(newGroups);
    // 새 그룹 추가 시 자동으로 열기
    setExpandedGroupIndex(newGroups.length - 1);
  };

  const handleRemoveGroup = (index: number) => {
    const updatedGroups = groups.filter((_, i) => i !== index);
    onGroupsChange(updatedGroups);
    // 삭제된 그룹이 열려있었으면 닫기
    if (expandedGroupIndex === index) {
      setExpandedGroupIndex(null);
    } else if (expandedGroupIndex !== null && expandedGroupIndex > index) {
      // 삭제된 그룹보다 뒤에 있던 열린 그룹의 인덱스 조정
      setExpandedGroupIndex(expandedGroupIndex - 1);
    }
  };

  const handleGroupToggle = (index: number) => {
    // 같은 그룹을 클릭하면 닫기, 다른 그룹을 클릭하면 해당 그룹만 열기
    setExpandedGroupIndex(expandedGroupIndex === index ? null : index);
  };

  const handleGroupUpdate = (index: number, updates: Partial<Group>) => {
    const updatedGroups = [...groups];
    updatedGroups[index] = { ...updatedGroups[index], ...updates };
    onGroupsChange(updatedGroups);
  };

  return (
    <View>
      {groups.length === 0 && (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.hintText}>
            그룹이 없습니다. 아래 버튼을 눌러 그룹을 추가하세요.
          </Text>
        </View>
      )}
      {groups.map((group, index) => (
        <View
          key={`group-${group.groupNumber}-${index}`}
          style={[styles.groupCard, { marginBottom: spacing.md }]}
        >
          <TouchableOpacity
            style={styles.groupHeader}
            onPress={() => handleGroupToggle(index)}
          >
            <Text style={styles.groupHeaderText}>
              Group {group.groupNumber}
              {group.groupName && `: ${group.groupName}`}
            </Text>
            <Text style={styles.expandIcon}>
              {expandedGroupIndex === index ? "▼" : "▶"}
            </Text>
          </TouchableOpacity>

          {expandedGroupIndex === index && (
            <View style={styles.groupContent}>
              <View style={styles.inVivoFieldFull}>
                <Text style={styles.label}>Group Name</Text>
                <TextInput
                  style={styles.inVivoInput}
                  value={group.groupName || ""}
                  onChangeText={(text) =>
                    handleGroupUpdate(index, { groupName: text })
                  }
                  placeholder="그룹명 입력"
                  placeholderTextColor="#999"
                />
              </View>

              {showAnimalCount && (
                <View style={styles.inVivoField}>
                  <Text style={styles.label}>n (Sample Size)</Text>
                  <TextInput
                    style={styles.inVivoInput}
                    value={group.n?.toString() || ""}
                    onChangeText={(text) => {
                      const num = parseInt(text, 10);
                      handleGroupUpdate(index, {
                        n: text === "" ? undefined : num,
                      });
                    }}
                    placeholder="예: 5"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
              )}

              <View style={styles.inVivoFieldFull}>
                <Text style={styles.label}>처리조건</Text>
                <TextInput
                  style={[styles.inVivoInput, { minHeight: 60 }]}
                  value={group.characteristics || ""}
                  onChangeText={(text) =>
                    handleGroupUpdate(index, { characteristics: text })
                  }
                  placeholder="처리조건 (자유 입력)"
                  placeholderTextColor="#999"
                  multiline
                />
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveGroup(index)}
              >
                <Text style={styles.removeButtonText}>그룹 삭제</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addGroupButton} onPress={handleAddGroup}>
        <Text style={styles.addGroupButtonText}>+ 그룹 추가</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  groupCard: {
    backgroundColor: colors.background.white90,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  groupHeaderText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    flex: 1,
  },
  expandIcon: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  groupContent: {
    marginTop: spacing.sm,
  },
  inVivoFieldFull: {
    width: "100%",
    marginBottom: spacing.md,
  },
  inVivoField: {
    width: "48%",
    marginBottom: spacing.md,
  },
  label: {
    ...commonStyles.label,
  },
  inVivoInput: {
    ...commonStyles.input,
    fontSize: typography.sizes.base,
    marginTop: spacing.sm,
  },
  removeButton: {
    backgroundColor: colors.background.white90,
    borderWidth: 1,
    borderColor: colors.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  removeButtonText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  addGroupButton: {
    backgroundColor: colors.background.white90,
    borderWidth: 1,
    borderColor: colors.success,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  addGroupButtonText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  emptyStateContainer: {
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  hintText: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    fontStyle: "italic",
    marginTop: spacing.sm,
  },
});
