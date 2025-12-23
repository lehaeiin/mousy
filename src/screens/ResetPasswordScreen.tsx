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
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import GradientBackground from "../components/gradientBackground";
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../styles/theme";
import type { RootStackParamList } from "../navigation/AppNavigator";

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ResetPassword"
>;

export default function ResetPasswordScreen() {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const { resetPasswordUrl, setResetPasswordUrl, signOut } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [allowReset, setAllowReset] = useState(false);

  // 표준 Supabase 플로우: PASSWORD_RECOVERY 이벤트로만 비밀번호 재설정 허용
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setAllowReset(true);
        }
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("오류", "새 비밀번호와 확인 비밀번호를 입력해주세요.");
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

    setLoading(true);
    try {
      // PASSWORD_RECOVERY 이벤트가 발생했을 때만 비밀번호 재설정 가능
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        Alert.alert(
          "오류",
          error.message || "비밀번호 변경에 실패했습니다. 다시 시도해주세요."
        );
      } else {
        // 비밀번호 변경 후 resetPasswordUrl 초기화
        setResetPasswordUrl(null);
        Alert.alert(
          "비밀번호 변경 완료",
          "비밀번호가 성공적으로 변경되었습니다. 로그인 화면으로 이동합니다.",
          [
            {
              text: "확인",
              onPress: async () => {
                // 로그아웃하여 로그인 화면으로 이동
                await signOut();
                navigation.navigate("Login");
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("오류", "예기치 않은 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // PASSWORD_RECOVERY 이벤트가 발생하지 않으면 접근 불가
  if (!allowReset) {
    return (
      <GradientBackground>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>비정상 접근입니다</Text>
            <Text style={styles.subtitle}>
              비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.
            </Text>
            <TouchableOpacity
              style={[styles.button, { marginTop: spacing.lg }]}
              onPress={() => {
                setResetPasswordUrl(null);
                navigation.navigate("Login");
              }}
            >
              <Text style={styles.buttonText}>로그인 화면으로 이동</Text>
            </TouchableOpacity>
          </View>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>비밀번호 재설정</Text>
          <Text style={styles.subtitle}>새로운 비밀번호를 입력해주세요.</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>새 비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="새 비밀번호를 입력하세요"
                placeholderTextColor={colors.text.tertiary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 다시 입력하세요"
                placeholderTextColor={colors.text.tertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text.white} />
              ) : (
                <Text style={styles.buttonText}>비밀번호 변경</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("Login")}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>로그인으로 돌아가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.sizes["3xl"],
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.white90,
    textAlign: "center",
    marginBottom: spacing.xxxl,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.white,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.white90,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    ...shadows.sm,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    ...shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.white,
  },
  backButton: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text.white70,
    textDecorationLine: "underline",
  },
});
