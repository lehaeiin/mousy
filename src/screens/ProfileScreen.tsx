import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useAuth } from "../contexts/AuthContext";
import type { RootStackParamList } from "../navigation/AppNavigator";
import GradientBackground from "../components/gradientBackground";
import { commonStyles } from "../styles/common";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "../styles/theme";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user, signOut, updatePassword } = useAuth();
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handleLogout = async () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("오류", "비밀번호를 입력해주세요.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("오류", "비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
      return;
    }

    setChangingPassword(true);
    try {
      const result = await updatePassword(newPassword);
      if (result.error) {
        Alert.alert(
          "오류",
          result.error.message || "비밀번호 변경에 실패했습니다."
        );
      } else {
        Alert.alert("성공", "비밀번호가 변경되었습니다.", [
          {
            text: "확인",
            onPress: () => {
              setShowPasswordChange(false);
              setNewPassword("");
              setConfirmPassword("");
            },
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert("오류", error.message || "비밀번호 변경에 실패했습니다.");
    } finally {
      setChangingPassword(false);
    }
  };

  const getInitials = (email: string | undefined) => {
    if (!email) return "?";
    return email.charAt(0).toUpperCase();
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
        <Text style={styles.topHeaderTitle}>프로필</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* 프로필 헤더 */}
        <BlurView intensity={20} style={styles.profileHeaderBlur}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(user?.email)}
                </Text>
              </View>
            </View>
            <Text style={styles.emailText}>{user?.email || "사용자"}</Text>
            {user?.user_metadata?.full_name && (
              <Text style={styles.nameText}>
                {user.user_metadata.full_name}
              </Text>
            )}
          </View>
        </BlurView>

        {/* 계정 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 정보</Text>
          <BlurView intensity={20} style={styles.infoCardBlur}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>이메일</Text>
              <Text style={styles.infoValue}>{user?.email || "-"}</Text>
            </View>
          </BlurView>
          <BlurView intensity={20} style={styles.infoCardBlur}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>가입일</Text>
              <Text style={styles.infoValue}>
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("ko-KR")
                  : "-"}
              </Text>
            </View>
          </BlurView>
        </View>

        {/* 비밀번호 변경 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>보안</Text>
          {!showPasswordChange ? (
            <BlurView intensity={20} style={styles.actionButtonBlur}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowPasswordChange(true)}
              >
                <Text style={styles.actionButtonText}>비밀번호 변경</Text>
              </TouchableOpacity>
            </BlurView>
          ) : (
            <BlurView intensity={20} style={styles.passwordChangeBlur}>
              <View style={styles.passwordChangeContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="새 비밀번호 (6자 이상)"
                  placeholderTextColor={colors.text.white70}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TextInput
                  style={styles.passwordInput}
                  placeholder="새 비밀번호 확인"
                  placeholderTextColor={colors.text.white70}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.passwordButtonContainer}>
                  <TouchableOpacity
                    style={[styles.passwordButton, styles.cancelButton]}
                    onPress={() => {
                      setShowPasswordChange(false);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.passwordButton, styles.confirmButton]}
                    onPress={handlePasswordChange}
                    disabled={changingPassword}
                  >
                    <Text style={styles.confirmButtonText}>
                      {changingPassword ? "변경 중..." : "변경"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          )}
        </View>

        {/* 로그아웃 */}
        <View style={styles.section}>
          <BlurView intensity={20} style={styles.logoutButtonBlur}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>로그아웃</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
  },
  content: {
    ...commonStyles.scrollContentWithHeader,
  },
  profileHeaderBlur: {
    ...commonStyles.glassContainer,
    marginBottom: spacing.xxxl,
  },
  profileHeader: {
    ...commonStyles.glassCard,
    alignItems: "center",
    padding: spacing.xxl,
  },
  avatarContainer: {
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.lg,
  },
  avatarText: {
    fontSize: typography.sizes["4xl"],
    fontWeight: typography.weights.bold,
    color: colors.text.white,
  },
  emailText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text.white90,
    marginBottom: spacing.xs,
  },
  nameText: {
    fontSize: typography.sizes.base,
    color: colors.text.white70,
  },
  section: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
    marginBottom: spacing.md,
  },
  infoCardBlur: {
    ...commonStyles.glassContainer,
    marginBottom: spacing.md,
  },
  infoCard: {
    ...commonStyles.glassCard,
    padding: spacing.lg,
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.white70,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.sizes.base,
    color: colors.text.white,
    fontWeight: typography.weights.medium,
  },
  actionButtonBlur: {
    ...commonStyles.glassContainer,
  },
  actionButton: {
    ...commonStyles.glassCard,
    padding: spacing.lg,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: typography.sizes.base,
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
  },
  passwordChangeBlur: {
    ...commonStyles.glassContainer,
  },
  passwordChangeContainer: {
    ...commonStyles.glassCard,
    padding: spacing.lg,
  },
  passwordInput: {
    ...commonStyles.input,
    marginBottom: spacing.md,
  },
  passwordButtonContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  passwordButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.background.white25,
  },
  cancelButtonText: {
    fontSize: typography.sizes.base,
    color: colors.text.white90,
    fontWeight: typography.weights.medium,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    fontSize: typography.sizes.base,
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
  },
  logoutButtonBlur: {
    ...commonStyles.glassContainer,
  },
  logoutButton: {
    ...commonStyles.glassCard,
    backgroundColor: "rgba(255, 59, 48, 0.3)",
    padding: spacing.lg,
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: typography.sizes.base,
    color: colors.text.white,
    fontWeight: typography.weights.semibold,
  },
});
