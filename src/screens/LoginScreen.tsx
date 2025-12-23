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
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { useAutoLogin } from "../hooks/useAutoLogin";
import GradientBackground from "../components/gradientBackground";
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} from "../styles/theme";
import { commonStyles } from "../styles/common";
import type { RootStackParamList } from "../navigation/AppNavigator";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn, signUp, signInWithKakao, resetPassword } = useAuth();
  const { autoLogin, savedEmail, setAutoLogin } = useAutoLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  useEffect(() => {
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, [savedEmail]);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("오류", "이메일과 비밀번호를 입력해주세요.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("오류", "비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      const result = isSignUp
        ? await signUp(email.trim(), password)
        : await signIn(email.trim(), password);

      if (result.error) {
        const errorTitle = isSignUp ? "회원가입 실패" : "로그인 실패";
        Alert.alert(
          errorTitle,
          result.error.message ||
            (isSignUp
              ? "회원가입에 실패했습니다. 다시 시도해주세요."
              : "로그인에 실패했습니다. 다시 시도해주세요.")
        );
      } else {
        if (!isSignUp) {
          await setAutoLogin(autoLogin, email.trim());
        }

        if (isSignUp) {
          Alert.alert(
            "회원가입 완료",
            "회원가입이 완료되었습니다. 이메일 인증을 확인해주세요."
          );
        }
      }
    } catch (error) {
      Alert.alert("오류", "예기치 않은 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        "이메일 입력 필요",
        "비밀번호 재설정을 위해 이메일을 입력해주세요.",
        [{ text: "확인", style: "default" }]
      );
      return;
    }

    Alert.alert(
      "비밀번호 재설정",
      `${email}로 비밀번호 재설정 링크를 보내드리겠습니다. 계속하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          onPress: async () => {
            setResetPasswordLoading(true);
            try {
              const result = await resetPassword(email.trim());
              if (result.error) {
                Alert.alert(
                  "오류",
                  result.error.message ||
                    "비밀번호 재설정 이메일 전송에 실패했습니다."
                );
              } else {
                Alert.alert(
                  "이메일 전송 완료",
                  "비밀번호 재설정 링크가 이메일로 전송되었습니다.\n\n이메일을 확인하고 링크를 클릭하면 웹 브라우저에서 비밀번호 재설정 페이지가 열립니다. 새 비밀번호를 설정한 후 앱에서 다시 로그인해주세요.",
                  [{ text: "확인" }]
                );
              }
            } catch (error) {
              Alert.alert("오류", "예기치 않은 오류가 발생했습니다.");
            } finally {
              setResetPasswordLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAutoLoginToggle = async (value: boolean) => {
    await setAutoLogin(value, email.trim());
  };

  const handleKakaoLogin = async () => {
    setKakaoLoading(true);
    try {
      const result = await signInWithKakao();
      if (result.error) {
        Alert.alert(
          "오류",
          result.error.message || "카카오톡 로그인에 실패했습니다."
        );
      }
    } catch (error) {
      Alert.alert("오류", "예기치 않은 오류가 발생했습니다.");
    } finally {
      setKakaoLoading(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Mousy</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? "회원가입" : "로그인"}
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>이메일</Text>
              <TextInput
                style={styles.input}
                placeholder="이메일을 입력하세요"
                placeholderTextColor={colors.text.tertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.passwordHeader}>
                <Text style={styles.label}>비밀번호</Text>
                {!isSignUp && (
                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    disabled={resetPasswordLoading || loading}
                  >
                    <Text style={styles.forgotPasswordText}>비밀번호 찾기</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor={colors.text.tertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                editable={!loading}
              />
            </View>

            {!isSignUp && (
              <View style={styles.autoLoginContainer}>
                <Switch
                  value={autoLogin}
                  onValueChange={handleAutoLoginToggle}
                  trackColor={{
                    false: colors.text.white70,
                    true: colors.primary,
                  }}
                  thumbColor={colors.text.white}
                  disabled={loading}
                />
                <Text style={styles.autoLoginText}>자동 로그인</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text.white} />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? "회원가입" : "로그인"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              <Text style={styles.switchText}>
                {isSignUp
                  ? "이미 계정이 있으신가요? 로그인"
                  : "계정이 없으신가요? 회원가입"}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[
                styles.kakaoButton,
                kakaoLoading && styles.buttonDisabled,
              ]}
              onPress={handleKakaoLogin}
              disabled={kakaoLoading || loading}
            >
              {kakaoLoading ? (
                <ActivityIndicator color="#f0f0f3" />
              ) : (
                <>
                  <Text style={styles.kakaoIcon}>💬</Text>
                  <Text style={styles.kakaoButtonText}>
                    카카오톡으로 로그인
                  </Text>
                </>
              )}
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
    fontSize: typography.sizes["5xl"],
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.xl,
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
    ...commonStyles.input,
    fontSize: typography.sizes.base,
    borderRadius: borderRadius.md,
    padding: spacing.md,
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
  switchButton: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  switchText: {
    fontSize: typography.sizes.sm,
    color: colors.text.white70,
    textDecorationLine: "underline",
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  forgotPasswordText: {
    fontSize: typography.sizes.sm,
    color: colors.text.white90,
    textDecorationLine: "underline",
  },
  autoLoginContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  autoLoginText: {
    fontSize: typography.sizes.sm,
    color: colors.text.white,
    marginLeft: spacing.sm,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.text.white90,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.text.white90,
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...shadows.md,
  },
  kakaoIcon: {
    fontSize: typography.sizes.xl,
    marginRight: spacing.sm,
  },
  kakaoButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: "#3A1D1D",
  },
});
